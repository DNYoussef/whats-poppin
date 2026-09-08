"""Operator-only probe of the explicitly named isolated staging backend."""
import json
import os
from pathlib import Path
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import uuid

from probe import migration_probe, verify

assert os.environ.get('GITHUB_ACTIONS') != 'true', 'Operator execution only'
state_path = Path(sys.argv[1]).resolve()
assert not state_path.is_relative_to(Path.cwd()), 'Credentials must be outside the checkout'
state = json.loads(state_path.read_text())
project, environment, services = state['projectId'], state['environmentId'], state['services']
assert project != 'b5dc8a11-2f0a-4956-a8ca-0899a0364649', 'Never probe the existing app project'
assert set(services) == {'db', 'auth', 'rest', 'gateway', 'mail'}
for value in [project, environment, *services.values()]:
    assert str(uuid.UUID(value)) == value
assert re.fullmatch(r'https://[a-z0-9-]+\.up\.railway\.app', state['api'])
credentials = state['credentials']
env = os.environ.copy()
env.update(RAILWAY_CALLER='skill:use-railway@1.4.0', RAILWAY_AGENT_SESSION='poppin-selfhost-20260907')
railway = shutil.which('railway.cmd') or shutil.which('railway')
assert railway
databases = []


def run(args, data=None, timeout=120):
    executable = shutil.which(args[0] + '.cmd') or shutil.which(args[0]) or args[0]
    result = subprocess.run([executable, *args[1:]], input=data, capture_output=True, text=True, env=env, timeout=timeout)
    assert result.returncode == 0, f'{Path(args[0]).name} failed ({result.returncode}); output withheld to protect credentials'
    return result.stdout.strip()


def api(query):
    result = json.loads(run([railway, 'api'], query))
    assert not result.get('errors'), 'Railway API operation failed'
    return result['data']


def inventory():
    result = api('query { project(id:"' + project + '") { name environments { edges { node { id name serviceInstances { edges { node { serviceId latestDeployment { id status } domains { serviceDomains { domain } } } } } } } } }')['project']
    assert result['name'] == 'whats-poppin-supabase-staging'
    matches = [edge['node'] for edge in result['environments']['edges'] if edge['node']['id'] == environment]
    assert len(matches) == 1 and matches[0]['name'] == 'staging'
    instances = {edge['node']['serviceId']: edge['node'] for edge in matches[0]['serviceInstances']['edges']}
    assert set(instances) == set(services.values())
    domains = instances[services['gateway']]['domains']['serviceDomains']
    assert domains == [{'domain': state['api'].removeprefix('https://')}]
    assert all(not instances[value]['domains']['serviceDomains'] for name, value in services.items() if name != 'gateway')
    return instances


inventory()


def ssh(service, command, data=None):
    return run([railway, 'ssh', '--project', project, '--environment', environment, '--service', services[service], '--', *command], data)


def sql(query, database='postgres'):
    result = ssh('db', ['psql', '-XAtq', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', database], query)
    if query.startswith('CREATE DATABASE self_host_migration_probe_'):
        databases.append(query.removeprefix('CREATE DATABASE ').strip().rstrip(';'))
    return result


def mail(path):
    assert re.fullmatch(r'/api/v1/messages|/api/v1/message/[a-zA-Z0-9-]+', path)
    return json.loads(ssh('gateway', ['wget', '-qO-', 'http://sb-mail.railway.internal:8025' + path]))


def signup(disabled):
    old = inventory()[services['auth']]['latestDeployment']['id']
    mutation = 'mutation { variableCollectionUpsert(input:{projectId:"' + project + '",environmentId:"' + environment + '",serviceId:"' + services['auth'] + '",skipDeploys:false,variables:{GOTRUE_DISABLE_SIGNUP:"' + str(disabled).lower() + '"}}) }'
    assert api(mutation)['variableCollectionUpsert']
    for _ in range(90):
        deployment = inventory()[services['auth']]['latestDeployment']
        if deployment and deployment['id'] != old and deployment['status'] == 'SUCCESS':
            print('SELF_HOST_SIGNUP_DISABLED' if disabled else 'SELF_HOST_SIGNUP_PROBE_OPEN', deployment['id'])
            return
        time.sleep(2)
    raise AssertionError('Auth configuration deployment did not succeed')


def restart():
    fingerprint = ['sh', '-c', 'find /etc/postgresql-custom/ -type f -exec sha256sum {} + | sort']
    before = ssh('db', fingerprint)
    started = sql('SELECT pg_postmaster_start_time()')
    assert 'pgsodium' in before
    deployment = inventory()[services['db']]['latestDeployment']
    assert deployment['status'] == 'SUCCESS'
    assert api('mutation { deploymentRestart(id:"' + deployment['id'] + '") }')['deploymentRestart']
    time.sleep(5)
    for _ in range(90):
        try:
            assert sql('SELECT 1') == '1'
            assert sql('SELECT pg_postmaster_start_time()') != started
            assert ssh('db', fingerprint) == before
            return
        except (AssertionError, subprocess.TimeoutExpired):
            time.sleep(2)
    raise AssertionError('Restarted database did not recover')


with tempfile.TemporaryDirectory(prefix='poppin-private-tunnel-') as directory:
    with socket.socket() as listener:
        listener.bind(('127.0.0.1', 0))
        port = listener.getsockname()[1]
    with (Path(directory) / 'tunnel.log').open('w') as log:
        tunnel = subprocess.Popen([railway, 'connect', 'sb-db', '--project', project, '--environment', environment, '--tunnel-only', '--port', str(port)], stdout=log, stderr=log, env=env,
                                  creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
        try:
            for _ in range(60):
                assert tunnel.poll() is None, 'Private tunnel exited'
                try:
                    with socket.create_connection(('127.0.0.1', port), timeout=1):
                        break
                except OSError:
                    time.sleep(1)
            else:
                raise AssertionError('Private tunnel not ready')
            signup(False)
            def migrate(suffix):
                return migration_probe(suffix, sql, run, lambda database: f"postgresql://postgres:{credentials['POSTGRES_PASSWORD']}@127.0.0.1:{port}/{database}?sslmode=disable")
            verify(state['api'], credentials['ANON_KEY'], credentials['SERVICE_ROLE_KEY'], credentials['JWT_SECRET'], sql, mail, migrate, restart)
        finally:
            try:
                signup(True)
            finally:
                try:
                    for database in databases:
                        assert re.fullmatch('self_host_migration_probe_[a-f0-9]{12}', database)
                        sql('DROP DATABASE ' + database)
                finally:
                    tunnel.terminate()
                    tunnel.wait(timeout=15)

assert sql("SELECT count(*) FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'self_host_probe_%'") == '0'
assert sql("SELECT count(*) FROM auth.users WHERE email LIKE '%@poppin.invalid'") == '0'
request = urllib.request.Request(state['api'] + '/auth/v1/signup', method='POST', headers={'apikey': credentials['ANON_KEY'], 'Content-Type': 'application/json'}, data=b'{"email":"disabled-control@poppin.invalid","password":"unused-probe-password"}')
try:
    urllib.request.urlopen(request, timeout=20)
    raise AssertionError('Signup still enabled')
except urllib.error.HTTPError as error:
    assert error.code == 403
assert all(instance['latestDeployment']['status'] == 'SUCCESS' for instance in inventory().values())
print('SELF_HOST_RAILWAY_VERIFIED')
