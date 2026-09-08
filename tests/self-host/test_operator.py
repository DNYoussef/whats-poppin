"""Secret-free target controls and real process/listener cleanup."""
import copy
from pathlib import Path
import socket
import sys
import tempfile
import uuid

from railway_operator import PROJECT, PRODUCTION, APP, check_target, check_instances, ssh_config, private_tunnel


def rejected(call):
    try:
        call()
    except (AssertionError, ValueError):
        return
    raise AssertionError("Known-bad control accepted")


services = {name: str(uuid.uuid4()) for name in ["db", "auth", "rest", "gateway", "mail"]}
environment = str(uuid.uuid4())
check_target(PROJECT, environment, services)
rejected(lambda: check_target(str(uuid.uuid4()), environment, services))
rejected(lambda: check_target(PROJECT, PRODUCTION, services))
rejected(lambda: check_target(PROJECT, environment, {**services, "db": APP}))
rejected(lambda: check_target(PROJECT, environment, {**services, "db": services["auth"]}))
instances = {sid: {"id": str(uuid.uuid4()), "serviceId": sid, "serviceName": "sb-" + name}
             for name, sid in services.items()}
instances[APP] = {"id": str(uuid.uuid4()), "serviceId": APP, "serviceName": "whats-poppin"}
check_instances(instances, services)
bad = copy.deepcopy(instances)
bad[services["db"]]["serviceName"] = "whats-poppin"
rejected(lambda: check_instances(bad, services))
rejected(lambda: check_instances({k: v for k, v in instances.items() if k != services["db"]}, services))
instance = instances[services["db"]]["id"]
block = f"Host poppin-db\n HostName ssh.railway.com\n User {instance}\n ServerAliveInterval 30\n ServerAliveCountMax 3\n"
assert "User " + instance in ssh_config(block, "poppin-db", instance)
for evil in [block + " ProxyCommand evil\n", block.replace(instance, str(uuid.uuid4())),
             block.replace("ssh.railway.com", "evil.invalid"), block + " Include other\n"]:
    rejected(lambda: ssh_config(evil, "poppin-db", instance))

# A real child owns this listener. Both normal and exceptional paths must reap it.
for fail in [False, True]:
    with socket.socket() as reservation:
        reservation.bind(("127.0.0.1", 0))
        port = reservation.getsockname()[1]
    code = "import socket,time;s=socket.socket();s.bind(('127.0.0.1'," + str(port) + "));s.listen();time.sleep(60)"
    with tempfile.TemporaryDirectory() as directory:
        try:
            with private_tunnel([sys.executable, "-c", code], port, Path(directory) / "log") as child:
                assert child.poll() is None
                if fail:
                    raise ValueError("forced probe error")
        except ValueError:
            assert fail
        assert child.poll() is not None
        with socket.socket() as probe:
            assert probe.connect_ex(("127.0.0.1", port)) != 0, "listener leaked"
with tempfile.TemporaryDirectory() as directory:
    rejected(lambda: private_tunnel([sys.executable, "-c", "raise SystemExit(1)"], port, Path(directory) / "log").__enter__())
# A foreign listener must never allow the context body to execute.
with socket.socket() as foreign, tempfile.TemporaryDirectory() as directory:
    foreign.bind(("127.0.0.1", 0))
    foreign.listen()
    occupied = foreign.getsockname()[1]
    yielded = False
    try:
        with private_tunnel([sys.executable, "-c", "import time;time.sleep(5)"], occupied, Path(directory) / "log"):
            yielded = True
    except (AssertionError, OSError):
        pass
    assert not yielded, "Foreign listener accepted as private tunnel"

# Exercise the actual operator SQL function without running credentialed top-level code.
import ast
source = Path(__file__).with_name("run-railway.py").read_text(encoding="utf-8")
node = next(n for n in ast.parse(source).body if isinstance(n, ast.FunctionDef) and n.name == "sql")
namespace = {"databases": [], "re": __import__("re")}
def disconnected(*args, **kwargs):
    raise OSError("response lost after CREATE")
namespace["ssh"] = disconnected
exec(compile(ast.Module(body=[node], type_ignores=[]), "operator-sql-control", "exec"), namespace)
try:
    namespace["sql"]("CREATE DATABASE self_host_migration_probe_012345abcdef")
except OSError:
    pass
assert namespace["databases"] == ["self_host_migration_probe_012345abcdef"]
print("SELF_HOST_OPERATOR_TARGET_TUNNEL_VERIFIED")
