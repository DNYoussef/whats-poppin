"""Disposable hosted test. Never connects to a managed or Railway database."""
import json
import os
import secrets
import re
import subprocess
import sys
import time
import tempfile
from pathlib import Path

from probe import jwt, verify, migration_probe, assert_signup_disabled

assert sys.platform == 'linux' and os.environ.get('GITHUB_ACTIONS') == 'true', 'GitHub Linux only'
assert not any(os.environ.get(key) for key in ['RAILWAY_TOKEN', 'SUPABASE_ACCESS_TOKEN']), 'No platform credentials allowed'
env = os.environ.copy()
env.update(POSTGRES_PASSWORD=secrets.token_hex(32), JWT_SECRET=secrets.token_hex(32), AUTH_DB_PASSWORD=secrets.token_hex(32), REST_DB_PASSWORD=secrets.token_hex(32), API_URL='http://127.0.0.1:54329')
for key, role in [('ANON_KEY', 'anon'), ('SERVICE_ROLE_KEY', 'service_role')]:
    env[key] = jwt(env['JWT_SECRET'], {'role': role, 'iss': 'supabase', 'iat': int(time.time()), 'exp': int(time.time())+7200})
compose = ['docker', 'compose', '-p', 'poppin-selfhost-' + secrets.token_hex(6), '-f', 'infra/supabase/compose.yml']


def run(args, data=None, expected=0, timeout=300, workdir=None):
    result = subprocess.run(args, input=data, text=True, capture_output=True, env=env, timeout=timeout, cwd=workdir)
    if result.returncode != expected:
        # Do not print command arguments or container logs: either can contain tokens.
        output = result.stdout + result.stderr
        for key in ['POSTGRES_PASSWORD', 'AUTH_DB_PASSWORD', 'REST_DB_PASSWORD', 'JWT_SECRET', 'ANON_KEY', 'SERVICE_ROLE_KEY']:
            output = output.replace(env[key], '[REDACTED]')
        raise RuntimeError(f'{args[0]} failed with {result.returncode}: {output[-4000:]}')
    return result.stdout.strip()


def sql(query, database='postgres'):
    return run(compose + ['exec', '-T', 'db', 'psql', '-XAtq', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', database], query)


def ready():
    for _ in range(90):
        try:
            assert sql('SELECT 1') == '1'
            return
        except (RuntimeError, AssertionError):
            time.sleep(2)
    raise AssertionError('Database not ready')


def mail(path):
    return json.loads(run(compose + ['exec', '-T', 'gateway', 'wget', '-qO-', 'http://mail:8025' + path]))


def restart():
    # The key and custom configuration must survive replacement, not just process restart.
    fingerprint = ['exec', '-T', 'db', 'sh', '-c', 'find /etc/postgresql-custom/ -type f -exec sha256sum {} + | sort']
    before = run(compose + fingerprint)
    assert 'pgsodium' in before and before.strip(), 'No persisted encryption key found'
    run(compose + ['up', '-d', '--no-deps', '--force-recreate', 'db'])
    ready()
    assert run(compose + fingerprint) == before, 'Database configuration/key changed on replacement'


def migrate(suffix):
    container = run(compose + ['ps', '-q', 'db'])
    address = json.loads(run(['docker', 'inspect', container]))[0]['NetworkSettings']['Networks']
    assert len(address) == 1
    ip = next(iter(address.values()))['IPAddress']
    return migration_probe(suffix, sql, run, lambda database: f"postgresql://postgres:{env['POSTGRES_PASSWORD']}@{ip}:5432/{database}?sslmode=disable")


try:
    # An actual missing-secret compose parse must fail before the valid startup.
    saved = env.pop('JWT_SECRET')
    control = subprocess.run(compose + ['config', '--quiet'], env=env, capture_output=True)
    env['JWT_SECRET'] = saved
    assert control.returncode != 0, 'Missing-secret control was accepted'
    run(compose + ['up', '-d', '--build'], timeout=900)
    ready()
    for key, value in [('ANON_KEY', 'bad key\" 1; }'), ('SB_AUTH_HOST', 'auth; injection')]:
        bad = subprocess.run(compose + ['run', '--rm', '--no-deps', '-e', key + '=' + value, 'gateway', 'nginx', '-t'], env=env, capture_output=True, timeout=60)
        assert bad.returncode != 0, 'Gateway injection control was accepted'
    verify(env['API_URL'], env['ANON_KEY'], env['SERVICE_ROLE_KEY'], env['JWT_SECRET'], sql, mail, migrate, restart)
    with tempfile.TemporaryDirectory(prefix='poppin-disabled-') as directory:
        override = Path(directory) / 'disabled.json'
        override.write_text(json.dumps({'services': {'auth': {'environment': {'GOTRUE_DISABLE_SIGNUP': 'true'}}}}))
        run(compose + ['-f', str(override), 'up', '-d', '--no-deps', '--force-recreate', 'auth'])
        for _ in range(60):
            try:
                assert_signup_disabled(env['API_URL'], env['ANON_KEY'])
                break
            except (AssertionError, OSError):
                time.sleep(2)
        else:
            raise AssertionError('Disabled Auth never ready')
except Exception:
    logs = subprocess.run(compose + ['logs', '--no-color', '--tail', '60'], env=env, capture_output=True, text=True, timeout=30)
    output = logs.stdout + logs.stderr
    for key in ['POSTGRES_PASSWORD', 'AUTH_DB_PASSWORD', 'REST_DB_PASSWORD', 'JWT_SECRET', 'ANON_KEY', 'SERVICE_ROLE_KEY']:
        output = output.replace(env[key], '[REDACTED]')
    output = re.sub(r'eyJ[A-Za-z0-9_.-]+', '[JWT REDACTED]', output)
    output = re.sub(r'(token|password|secret)([= :]+)[^\s&\"]+', r'\1\2[REDACTED]', output, flags=re.I)
    print(output[-8000:])
    raise
finally:
    run(compose + ['down', '--volumes', '--remove-orphans'], timeout=120)
