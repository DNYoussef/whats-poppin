"""Real core-Supabase checks, shared by disposable CI and explicit Railway staging."""
import concurrent.futures
import hmac
import base64
import html
import json
import re
import secrets
import time
import sys
import threading
import tempfile
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request


def jwt(secret, claims):
    def part(value):
        return base64.urlsafe_b64encode(json.dumps(value, separators=(',', ':')).encode()).rstrip(b'=')
    message = part({'alg': 'HS256', 'typ': 'JWT'}) + b'.' + part(claims)
    return (message + b'.' + base64.urlsafe_b64encode(hmac.digest(secret.encode(), message, 'sha256')).rstrip(b'=')).decode()


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def verify(api, anon, admin, secret, sql, mail, migrate, restart):
    opener = urllib.request.build_opener(NoRedirect)

    def request(path, token=None, method='GET', body=None, expected=200, key=anon, extra_headers=None):
        headers = {'Content-Type': 'application/json', 'Prefer': 'return=representation'}
        headers.update(extra_headers or {})
        if key is not None:
            headers['apikey'] = key
        if token is not None:
            headers['Authorization'] = 'Bearer ' + token
        req = urllib.request.Request(api + path, method=method, headers=headers,
                                     data=None if body is None else json.dumps(body).encode())
        try:
            response = opener.open(req, timeout=20)
        except urllib.error.HTTPError as error:
            response = error
        data = response.read()
        assert response.status == expected, f'{method} {urllib.parse.urlsplit(path).path}: status {response.status}, expected {expected}'
        try:
            parsed = json.loads(data) if data else None
        except json.JSONDecodeError:
            parsed = None
        return parsed, response.headers

    for _ in range(90):
        try:
            request('/auth/v1/health')
            request('/rest/v1/')
            break
        except (AssertionError, urllib.error.URLError):
            time.sleep(2)
    else:
        raise AssertionError('Core API never became healthy')
    request('/auth/v1/health', key=None, expected=401)
    request('/rest/v1/', key='invalid-key', expected=401)
    request('/unsupported', expected=404)
    request('/rest/v1/', method='OPTIONS', key=None, expected=204)
    _, allowed = request('/auth/v1/health', extra_headers={'Origin': 'http://localhost:3000'})
    _, denied = request('/auth/v1/health', extra_headers={'Origin': 'https://untrusted.invalid'})
    print('SELF_HOST_CORS_HEADERS', json.dumps({
        'allowed': allowed.get_all('Access-Control-Allow-Origin', []),
        'denied': denied.get_all('Access-Control-Allow-Origin', []),
    }), flush=True)
    assert allowed.get('Access-Control-Allow-Origin') == 'http://localhost:3000'
    assert denied.get('Access-Control-Allow-Origin') is None

    extensions = json.loads(sql("CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS vector; CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; SELECT json_object_agg(extname, extversion) FROM pg_extension WHERE extname IN ('postgis','vector','uuid-ossp');").splitlines()[-1])
    assert set(extensions) == {'postgis', 'vector', 'uuid-ossp'}
    print('SELF_HOST_EXTENSIONS', json.dumps(extensions, sort_keys=True))
    suffix = secrets.token_hex(6)
    table = 'self_host_probe_' + suffix
    cleanup_users = []
    try:
        sql(f'CREATE TABLE public.{table} (id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES auth.users(id), value text NOT NULL); '
            f'ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY; '
            f'GRANT SELECT ON public.{table} TO anon; GRANT SELECT, INSERT, UPDATE, DELETE ON public.{table} TO authenticated; '
            f'CREATE POLICY owner_only ON public.{table} TO authenticated USING (owner_id=auth.uid()) WITH CHECK (owner_id=auth.uid()); '
            "NOTIFY pgrst, 'reload schema';")
        path = '/rest/v1/' + table
        for _ in range(30):
            try:
                request(path)
                break
            except AssertionError:
                time.sleep(1)
        else:
            raise AssertionError('Probe table not visible to PostgREST')

        users = []
        for name in ['alice', 'bob']:
            email = f'{name}-{suffix}@poppin.invalid'
            password = secrets.token_hex(24)
            signup, _ = request('/auth/v1/signup', method='POST', body={'email': email, 'password': password})
            cleanup_users.append(signup.get('id') or signup.get('user', {}).get('id'))
            assert cleanup_users[-1], 'Signup returned no user ID'
            assert not signup.get('access_token'), 'Email confirmation must be required'
            request('/auth/v1/token?grant_type=password', method='POST', body={'email': email, 'password': password}, expected=400)
            link = None
            for _ in range(30):
                messages = mail('/api/v1/messages').get('messages', [])
                matches = [m for m in messages if any(to.get('Address') == email for to in m.get('To', []))]
                if matches:
                    content = mail('/api/v1/message/' + matches[0]['ID'])
                    for candidate in re.findall(r'https?://[^\s<>"\']+', html.unescape(content.get('HTML', ''))):
                        url = urllib.parse.urlsplit(candidate)
                        if url.netloc == urllib.parse.urlsplit(api).netloc and url.path == '/auth/v1/verify':
                            link = url.path + '?' + url.query
                            break
                if link:
                    break
                time.sleep(1)
            assert link, 'Confirmation email was not captured privately'
            _, headers = request(link, key=None, expected=303)
            assert urllib.parse.urlsplit(headers['Location']).netloc == 'localhost:3000'
            session, _ = request('/auth/v1/token?grant_type=password', method='POST', body={'email': email, 'password': password})
            assert session['user']['email'] == email
            assert session['user']['email_confirmed_at']
            users.append(session)
        print('SELF_HOST_CONFIRMATION_VERIFIED')

        rows = []
        import uuid
        for i, user in enumerate(users):
            row = {'id': str(uuid.uuid4()), 'owner_id': user['user']['id'], 'value': f'private-{suffix}-{i}'}
            created, _ = request(path, user['access_token'], 'POST', row, 201)
            assert created == [row]
            rows.append(row)
        # Known-bad row control establishes the exact absence oracle can reject a leak.
        def exact(actual, expected):
            assert actual == expected, 'Cross-user probe data leaked or owner data missing'
        try:
            exact([rows[0]], [])
        except AssertionError:
            pass
        else:
            raise AssertionError('Leak oracle accepted its positive control')
        exact(request(path)[0], [])
        exact(request(path, key=admin)[0], [])
        request('/auth/v1/admin/users', key=admin, expected=401)
        request('/rest/v1/users', extra_headers={'Accept-Profile': 'auth'}, expected=406)
        request('/rest/v1/users', method='POST', body={}, extra_headers={'Content-Profile': 'auth'}, expected=406)
        barrier = threading.Barrier(2, timeout=30)
        def paired(user):
            barrier.wait()
            return request(path, user['access_token'])[0]
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            for _ in range(3):
                responses = list(pool.map(paired, users))
                for i, response in enumerate(responses):
                    exact(response, [rows[i]])
        for i, user in enumerate(users):
            exact(responses[i], [rows[i]])
            exact(request(path + '?id=eq.' + rows[1-i]['id'], user['access_token'], 'PATCH', {'value': 'forbidden'})[0], [])
            request(path, user['access_token'], 'POST', {**rows[i], 'id': str(uuid.uuid4()), 'owner_id': users[1-i]['user']['id']}, 403)
            identity, _ = request('/auth/v1/user', user['access_token'])
            assert identity['id'] == user['user']['id']
        claims = {'sub': users[0]['user']['id'], 'role': 'authenticated', 'aud': 'authenticated', 'exp': int(time.time())+3600}
        request(path, jwt('wrong-signing-secret', claims), expected=401)
        request(path, jwt(secret, {**claims, 'exp': int(time.time())-60}), expected=401)
        print('SELF_HOST_IDENTITY_RLS_VERIFIED')

        migration_check = migrate(suffix)
        restart()
        assert json.loads(sql(f'SELECT json_agg(t ORDER BY value) FROM public.{table} t;').strip()) == sorted(rows, key=lambda row: row['value'])
        migration_check()
        print('SELF_HOST_PERSISTENCE_VERIFIED')

        for user in users:
            refreshed, _ = request('/auth/v1/token?grant_type=refresh_token', method='POST', body={'refresh_token': user['refresh_token']})
            assert refreshed['user']['id'] == user['user']['id']
            request('/auth/v1/logout?scope=global', refreshed['access_token'], 'POST', {}, 204)
            request('/auth/v1/token?grant_type=refresh_token', method='POST', body={'refresh_token': refreshed['refresh_token']}, expected=400)
    finally:
        failing = sys.exc_info()[0] is not None
        cleanup_errors = []
        try:
            sql(f'DROP TABLE IF EXISTS public.{table};')
        except Exception as error:
            cleanup_errors.append(type(error).__name__)
        for user_id in filter(None, cleanup_users):
            try:
                request('/auth/v1/admin/users/' + user_id, admin, 'DELETE', expected=200, key=admin)
            except Exception as error:
                cleanup_errors.append(type(error).__name__)
        if cleanup_errors:
            print('SELF_HOST_CLEANUP_FAILED', ','.join(cleanup_errors))
            if not failing:
                raise AssertionError('Probe cleanup failed')
    print('SELF_HOST_CLEANUP_VERIFIED')
    print('SELF_HOST_AUTH_LIFECYCLE_VERIFIED')
    print('SELF_HOST_CORE_VERIFIED')


def migration_probe(suffix, sql, run, db_url):
    database = "self_host_migration_probe_" + suffix
    sql("CREATE DATABASE " + database)
    url = db_url(database)
    with tempfile.TemporaryDirectory(prefix='poppin-migration-') as directory:
        folder = Path(directory) / 'supabase'
        (folder / 'migrations').mkdir(parents=True)
        (folder / 'config.toml').write_text('project_id = "self-host-probe"\n')
        (folder / 'migrations/20260907000001_probe.sql').write_text("CREATE TABLE public.probe(value text NOT NULL); INSERT INTO public.probe VALUES ('" + suffix + "');\n")
        push = ['supabase', 'db', 'push', '--db-url', url, '--workdir', directory, '--yes']
        def absent():
            assert sql("SELECT to_regclass('public.probe') IS NULL", database) == 't'
        absent()
        run(push + ['--dry-run'])
        absent()
        run(push)
        assert sql('SELECT value FROM public.probe', database) == suffix
        try:
            absent()
        except AssertionError:
            pass
        else:
            raise AssertionError('Dry-run absence oracle accepted a populated table')
        history = sql('SELECT version FROM supabase_migrations.schema_migrations ORDER BY version', database)
        assert history == '20260907000001'
        run(push)
        assert sql('SELECT version FROM supabase_migrations.schema_migrations ORDER BY version', database) == history
        (folder / 'migrations/20260907000002_forward.sql').write_text("ALTER TABLE public.probe ADD COLUMN note text NOT NULL DEFAULT 'schema-forward'; UPDATE public.probe SET value = value || '-forward';\n")
        run(push)

    def check():
        assert sql('SELECT note FROM public.probe', database) == 'schema-forward'
        assert sql('SELECT value FROM public.probe', database) == suffix + '-forward'
        assert sql('SELECT version FROM supabase_migrations.schema_migrations ORDER BY version', database) == '20260907000001\n20260907000002'
    check()
    print('SELF_HOST_MIGRATIONS_VERIFIED')
    return check


def assert_signup_disabled(api, anon):
    def denied(status, body):
        assert status in [403, 422] and body.get('error_code') == 'signup_disabled', 'Unexpected signup denial'
    try:
        denied(403, {'error_code': 'unrelated_error'})
    except AssertionError:
        pass
    else:
        raise AssertionError('Wrong-error control was accepted')
    request = urllib.request.Request(api + '/auth/v1/signup', method='POST', headers={'apikey': anon, 'Content-Type': 'application/json'}, data=b'{"email":"disabled-control@poppin.invalid","password":"unused-probe-password"}')
    try:
        urllib.request.urlopen(request, timeout=20)
    except urllib.error.HTTPError as error:
        body = json.loads(error.read())
        denied(error.code, body)
    else:
        raise AssertionError('Signup still enabled')
    print('SELF_HOST_SIGNUP_DENIAL_VERIFIED')
