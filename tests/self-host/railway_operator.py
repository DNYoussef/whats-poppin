"""Staging-only identity checks and directly owned OpenSSH process lifetime."""
from contextlib import contextmanager
import os
import socket
import subprocess
import time
import uuid

PROJECT = 'b5dc8a11-2f0a-4956-a8ca-0899a0364649'
PRODUCTION = 'ca92fc09-72e1-4d21-a8e4-5b1480d58b73'
APP = 'ccc86351-94ec-4e97-80a8-78932ba45d46'


def check_target(project, environment, services):
    assert project == PROJECT, 'Unexpected project'
    assert environment != PRODUCTION, 'Production probes forbidden'
    assert set(services) == {'db', 'auth', 'rest', 'gateway', 'mail'}
    assert len(set(services.values())) == len(services), 'Duplicate service IDs'
    assert APP not in services.values(), 'App service probes forbidden'
    for value in [project, environment, *services.values()]:
        assert str(uuid.UUID(value)) == value, 'Noncanonical resource ID'


def check_instances(instances, services):
    assert set(services.values()) <= instances.keys(), 'Core service missing'
    for name, service in services.items():
        assert instances[service]['serviceId'] == service
        assert instances[service]['serviceName'] == 'sb-' + name, 'Wrong core service'
        assert str(uuid.UUID(instances[service]['id'])) == instances[service]['id']


def ssh_config(block, alias, instance):
    """Accept only the pinned CLI's small generated block, never arbitrary SSH directives."""
    assert str(uuid.UUID(instance)) == instance
    expected = {'Host': alias, 'HostName': 'ssh.railway.com', 'User': instance,
                'ServerAliveInterval': '30', 'ServerAliveCountMax': '3'}
    actual = {}
    for line in block.splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        key, value = line.split(None, 1)
        assert key not in actual, 'Duplicate SSH directive'
        actual[key] = value
    assert actual == expected, 'Unexpected SSH configuration or target'
    return '\n'.join(key + ' ' + value for key, value in expected.items()) + '\n'


@contextmanager
def private_tunnel(command, port, log_path):
    """Run a native process without a shell, multiplexing, or proxy children."""
    with socket.socket() as reservation:
        reservation.bind(('127.0.0.1', port))
    with log_path.open('w') as log:
        child = subprocess.Popen(command, stdin=subprocess.DEVNULL, stdout=log, stderr=log,
                                 creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
        try:
            deadline = time.monotonic() + 30
            while time.monotonic() < deadline:
                assert child.poll() is None, 'Private tunnel exited; inspect private tunnel log'
                try:
                    with socket.create_connection(('127.0.0.1', port), timeout=0.2):
                        assert child.poll() is None, 'Tunnel exited during readiness check'
                        break
                except OSError:
                    time.sleep(0.1)
            else:
                raise AssertionError('Private tunnel not ready')
            yield child
        finally:
            if child.poll() is None:
                child.terminate()
            try:
                child.wait(timeout=5)
            except subprocess.TimeoutExpired:
                child.kill()
                child.wait(timeout=5)
            with socket.socket() as probe:
                probe.settimeout(1)
                assert probe.connect_ex(('127.0.0.1', port)) != 0, 'Port still occupied after child reaped; cleanup inconclusive'
