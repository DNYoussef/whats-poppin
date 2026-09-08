"""Real core-Supabase checks, shared by disposable CI and explicit Railway staging."""
import concurrent.futures
import hmac
import base64
import html
import json
import re
import secrets
import time
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

    def request(path, token=None, method='GET', body=None, expected=200, key=anon):
        headers = {'Content-Type': 'application/json', 'Prefer': 'return=representation'}
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

    extensions = json.loads(sql("CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS vector; CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; SELECT json_object_agg(extname, extversion) FROM pg_extension WHERE extname IN ('postgis','vector','uuid-ossp');").splitlines()[-1])
    assert set(extensions) == {'postgis', 'vector', 'uuid-ossp'}
    print('SELF_HOST_EXTENSIONS', json.dumps(extensions, sort_keys=True))
    suffix = secrets.token_hex(6)
    table = 'self_host_probe_' + suffix
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
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(lambda user: request(path, user['access_token'])[0], users))
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
    sql(f'DROP TABLE public.{table};')
    for user in users:
        request('/auth/v1/admin/users/' + user['user']['id'], admin, 'DELETE', expected=200, key=admin)
    print('SELF_HOST_AUTH_LIFECYCLE_VERIFIED')
    print('SELF_HOST_CORE_VERIFIED')
