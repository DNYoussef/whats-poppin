"""Operator-only probe of the explicitly named isolated staging backend."""
import json
import os
from pathlib import Path
import re
import shutil
import shlex
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import uuid

from probe import migration_probe, verify, assert_signup_disabled
from railway_operator import check_target, check_instances, ssh_config, private_tunnel



def project_query(project, environment, services):
    query = 'query { project(id:' + json.dumps(project) + ') { name environments { edges { node { id name serviceInstances { edges { node { id serviceId serviceName source { repo image } latestDeployment { id status meta } domains { customDomains { id } serviceDomains { domain } } } } } } } } }'
    for name, service in services.items():
        query += ' ' + name + ': tcpProxies(environmentId:' + json.dumps(environment) + ',serviceId:' + json.dumps(service) + ') { id }'
    return query + ' }'


def check_query(query):
    assert query.count('{') == query.count('}'), 'Unbalanced GraphQL query'


def check_toggle(before, after, disabled):
    expected = {key: value for key, value in before.items() if not key.startswith('RAILWAY_')}
    assert {'GOTRUE_DB_DATABASE_URL', 'GOTRUE_JWT_SECRET', 'API_EXTERNAL_URL'} <= expected.keys(), 'Auth configuration incomplete'
    expected['GOTRUE_DISABLE_SIGNUP'] = str(disabled).lower()
    assert all(key in after and after[key] == value for key, value in expected.items()), 'Auth variables changed unexpectedly'


if sys.argv[1:] == ['--check']:
    check_query(project_query('fixture', 'fixture', {'db': 'fixture'}))
    try:
        check_query('query { project { name }')
    except AssertionError:
        pass
    else:
        raise AssertionError('Malformed-query control accepted')
    before = dict(GOTRUE_DB_DATABASE_URL='fixture-db', GOTRUE_JWT_SECRET='fixture-jwt', API_EXTERNAL_URL='fixture-url', GOTRUE_DISABLE_SIGNUP='true')
    after = {**before, 'GOTRUE_DISABLE_SIGNUP': 'false'}
    check_toggle(before, after, False)
    for bad in [before, {'GOTRUE_DISABLE_SIGNUP': 'false'}, {**after, 'GOTRUE_JWT_SECRET': 'changed'}]:
        try:
            check_toggle(before, bad, False)
        except AssertionError:
            pass
        else:
            raise AssertionError('Destructive-toggle control accepted')
    print('SELF_HOST_OPERATOR_QUERY_VERIFIED')
    sys.exit(0)

assert os.environ.get('GITHUB_ACTIONS') != 'true', 'Operator execution only'
state_path = Path(sys.argv[1]).resolve()
assert not state_path.is_relative_to(Path.cwd()), 'Credentials must be outside the checkout'
state = json.loads(state_path.read_text())
project, environment, services = state['projectId'], state['environmentId'], state['services']
check_target(project, environment, services)
assert re.fullmatch(r'https://[a-z0-9-]+\.up\.railway\.app', state['api'])
credentials = state['credentials']
assert {'POSTGRES_PASSWORD', 'AUTH_DB_PASSWORD', 'REST_DB_PASSWORD', 'JWT_SECRET', 'ANON_KEY', 'SERVICE_ROLE_KEY'} <= credentials.keys(), 'Incomplete credential state'
assert all(isinstance(value, str) and value for value in credentials.values()), 'Invalid credential state'
env = os.environ.copy()
env.update(RAILWAY_CALLER='skill:use-railway@1.4.0', RAILWAY_AGENT_SESSION='poppin-selfhost-20260907')
railway = shutil.which('railway.exe') or shutil.which('railway')
if not railway or Path(railway).suffix.lower() == '.cmd':
    wrapper = shutil.which('railway.cmd')
    railway = str(Path(wrapper).parent / 'node_modules/@railway/cli/bin/railway.exe') if wrapper else None
assert railway and Path(railway).is_file(), 'Native Railway executable required'
ssh_binary = shutil.which('ssh.exe') or shutil.which('ssh')
assert ssh_binary, 'OpenSSH required'
identity = Path(state['sshIdentityFile']).resolve()
assert identity.is_file() and not identity.is_relative_to(Path.cwd()), 'External registered SSH identity required'
assert not any(c in str(identity) for c in ['\n', '\r', '"']), 'Invalid identity path'
known_hosts = state_path.parent / 'known_hosts'
assert not any(c in str(known_hosts) for c in ['\n', '\r', '"']), 'Invalid known-hosts path'
ssh_options = {}
databases = []


def run(args, data="", timeout=30):
    executable = args[0] if Path(args[0]).is_absolute() else (shutil.which(args[0]) or args[0])
    try:
        result = subprocess.run([executable, *args[1:]], input=data or '', capture_output=True, text=True, env=env, timeout=timeout)
    except subprocess.TimeoutExpired:
        raise AssertionError(f'{Path(args[0]).name} timed out after {timeout}s') from None
    if result.returncode != 0:
        output = result.stdout + result.stderr
        for value in credentials.values():
            output = output.replace(value, '[REDACTED]')
        output = re.sub(r'eyJ[A-Za-z0-9_.-]+', '[JWT REDACTED]', output)
        output = re.sub(r'(token|password|secret)([= :]+)[^\s&\"]+', r'\1\2[REDACTED]', output, flags=re.I)
        raise AssertionError(f'{Path(args[0]).name} failed ({result.returncode}): {output[-2000:]}')
    return result.stdout.strip()


def api(query):
    check_query(query)
    result = json.loads(run([railway, 'api'], query))
    assert not result.get('errors'), 'Railway API operation failed'
    return result['data']


def inventory():
    data = api(project_query(project, environment, services))
    assert all(data[name] == [] for name in services), 'Public TCP proxy found'
    result = data['project']
    assert result['name'] == 'industrious-compassion'
    matches = [edge['node'] for edge in result['environments']['edges'] if edge['node']['id'] == environment]
    assert len(matches) == 1 and matches[0]['name'] == 'staging'
    instances = {edge['node']['serviceId']: edge['node'] for edge in matches[0]['serviceInstances']['edges']}
    check_instances(instances, services)
    instances = {service: instances[service] for service in services.values()}
    for name, service in services.items():
        instance = instances[service]
        assert instance['serviceName'] == 'sb-' + name
        assert not instance['domains']['customDomains']
        if name in ['db', 'gateway']:
            assert instance['source']['repo'] == 'DNYoussef/whats-poppin'
            assert ((instance.get('latestDeployment') or {}).get('meta') or {}).get('commitHash') == state['sourceSha']
        else:
            assert instance['source']['image'] == state['images'][name]
    domains = instances[services['gateway']]['domains']['serviceDomains']
    assert domains == [{'domain': state['api'].removeprefix('https://')}]
    assert all(not instances[value]['domains']['serviceDomains'] for name, value in services.items() if name != 'gateway')
    return instances


inventory()
assert run([railway, '--version']) == 'railway 5.49.3', 'Review SSH config parser before changing Railway CLI version'
assert 'dry-run' in run([railway, 'ssh', 'config', '--help'])
assert 'query' in run([railway, 'api', '--help']).lower()
assert run(['supabase', '--version']) == '2.117.0'
print('SELF_HOST_OPERATOR_CLI', run([railway, '--version']))


def ssh(service, command, data="", timeout=30):
    return run([ssh_binary, *ssh_options[service], 'poppin-' + service, shlex.join(command)], data, timeout=timeout)


def sql(query, database='postgres', timeout=30):
    if query.startswith('CREATE DATABASE self_host_migration_probe_'):
        name = query.removeprefix('CREATE DATABASE ').strip().rstrip(';')
        assert re.fullmatch('self_host_migration_probe_[a-f0-9]{12}', name)
        databases.append(name)
    return ssh('db', ['psql', '-XAtq', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', database], query, timeout=timeout)


def mail(path):
    assert re.fullmatch(r'/api/v1/messages|/api/v1/message/[a-zA-Z0-9-]+', path)
    return json.loads(ssh('gateway', ['wget', '-qO-', 'http://sb-mail.railway.internal:8025' + path]))


def signup(disabled):
    if disabled:
        try:
            assert_signup_disabled(state['api'], credentials['ANON_KEY'])
            return
        except (AssertionError, OSError):
            pass
    old = inventory()[services['auth']]['latestDeployment']['id']
    query = 'query { variables(projectId:"' + project + '",environmentId:"' + environment + '",serviceId:"' + services['auth'] + '",unrendered:true) }'
    before = api(query)['variables']
    mutation = 'mutation { variableCollectionUpsert(input:{projectId:"' + project + '",environmentId:"' + environment + '",serviceId:"' + services['auth'] + '",replace:false,skipDeploys:false,variables:{GOTRUE_DISABLE_SIGNUP:"' + str(disabled).lower() + '"}}) }'
    assert api(mutation)['variableCollectionUpsert']
    check_toggle(before, api(query)['variables'], disabled)
    deadline = time.monotonic() + 300
    for _ in range(90):
        if time.monotonic() >= deadline:
            break
        deployment = inventory()[services['auth']]['latestDeployment']
        if deployment and deployment['id'] != old and deployment['status'] == 'SUCCESS':
            if disabled:
                try:
                    assert_signup_disabled(state['api'], credentials['ANON_KEY'])
                except (AssertionError, OSError):
                    time.sleep(2)
                    continue
            print('SELF_HOST_SIGNUP_DISABLED' if disabled else 'SELF_HOST_SIGNUP_PROBE_OPEN', deployment['id'])
            return
        time.sleep(2)
    raise AssertionError('Auth deployment or requested signup state did not become ready')


def restart():
    fingerprint = ['sh', '-c', 'find /etc/postgresql-custom/ -type f -exec sha256sum {} + | sort']
    before = ssh('db', fingerprint)
    started = sql('SELECT pg_postmaster_start_time()')
    assert 'pgsodium' in before
    deployment = inventory()[services['db']]['latestDeployment']
    assert deployment['status'] == 'SUCCESS'
    assert api('mutation { deploymentRestart(id:"' + deployment['id'] + '") }')['deploymentRestart']
    time.sleep(5)
    deadline = time.monotonic() + 300
    while time.monotonic() < deadline:
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
    current = inventory()
    for name in ['db', 'gateway']:
        alias = 'poppin-' + name
        config_path = Path(directory) / (name + '.config')
        block = run([railway, 'ssh', 'config', '--dry-run', '--project', project,
                     '--environment', environment, '--service', services[name], '--alias', alias,
                     '--path', str(config_path)])
        config_path.write_text(ssh_config(block, alias, current[services[name]]['id']), encoding='ascii')
        ssh_options[name] = ['-F', str(config_path), '-i', str(identity),
            '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15',
            '-o', 'StrictHostKeyChecking=accept-new', '-o', 'UserKnownHostsFile="' + known_hosts.as_posix() + '"',
            '-o', 'GlobalKnownHostsFile=none', '-o', 'UpdateHostKeys=no', '-o', 'ControlMaster=no',
            '-o', 'ControlPath=none', '-o', 'ProxyCommand=none', '-o', 'ProxyJump=none']
    command = [ssh_binary, *ssh_options['db'], '-o', 'ExitOnForwardFailure=yes', '-N',
               '-L', f'127.0.0.1:{port}:127.0.0.1:5432', 'poppin-db']
    with private_tunnel(command, port, Path(directory) / 'tunnel.log'):
        signup_attempted = False
        try:
            ssh('db', ['true'])
            assert sql('SELECT 1') == '1'
            signup_attempted = True
            signup(False)
            def migrate(suffix):
                return migration_probe(suffix, sql, run, lambda database: f"postgresql://postgres:{credentials['POSTGRES_PASSWORD']}@127.0.0.1:{port}/{database}?sslmode=disable")
            verify(state['api'], credentials['ANON_KEY'], credentials['SERVICE_ROLE_KEY'], credentials['JWT_SECRET'], sql, mail, migrate, restart)
            print('SELF_HOST_PRIVATE_ACCESS_VERIFIED')
        finally:
            errors = []
            for attempt in range(2 if signup_attempted else 0):
                try:
                    signup(True)
                    break
                except Exception:
                    print('SELF_HOST_SIGNUP_DISABLE_FAILED', services['auth'])
                    if attempt == 1:
                        errors.append('signup disable failed; operator action required')
            if signup_attempted:
                try:
                    sql("DELETE FROM auth.users WHERE email='disabled-control@poppin.invalid'")
                except Exception as error:
                    errors.append('signup control cleanup: ' + type(error).__name__)
            for database in databases:
                assert re.fullmatch('self_host_migration_probe_[a-f0-9]{12}', database)
                try:
                    sql('DROP DATABASE IF EXISTS ' + database + ' WITH (FORCE)')
                except Exception as error:
                    errors.append('migration cleanup: ' + type(error).__name__)
            if errors:
                print('SELF_HOST_OPERATOR_CLEANUP_FAILED', '; '.join(errors))
                if sys.exc_info()[0] is None:
                    raise AssertionError('Operator cleanup failed')

    assert sql("SELECT count(*) FROM pg_database WHERE datname LIKE 'self_host_migration_probe_%'") == '0'
    assert sql("SELECT count(*) FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'self_host_probe_%'") == '0'
    assert sql("SELECT count(*) FROM auth.users WHERE email LIKE '%@poppin.invalid'") == '0'
    assert_signup_disabled(state['api'], credentials['ANON_KEY'])
    assert all((instance.get('latestDeployment') or {}).get('status') == 'SUCCESS' for instance in inventory().values())
    print('SELF_HOST_RAILWAY_VERIFIED')
