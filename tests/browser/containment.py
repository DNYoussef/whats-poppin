"""Run against this checkout's production build; never use a hosted app URL."""
import os
import socket
import subprocess
import time
import urllib.error
import urllib.request
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

with socket.socket() as listener:
    listener.bind(('127.0.0.1', 0))
    port = listener.getsockname()[1]
base = f'http://127.0.0.1:{port}'
env = {**os.environ, 'NEXT_PUBLIC_SUPABASE_URL': 'http://127.0.0.1:54321',
       'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'ci-public-fixture', 'OPENAI_API_KEY': '',
       'NEXT_TELEMETRY_DISABLED': '1'}
server = subprocess.Popen(
    ['node', 'node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', str(port)],
    env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT,
    creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0,
)
page_errors = []
try:
    for attempt in range(100):
        assert server.poll() is None, 'Production server exited before readiness'
        try:
            with urllib.request.urlopen(base + '/api/health', timeout=1) as response:
                if response.status == 200:
                    break
        except (urllib.error.URLError, TimeoutError):
            time.sleep(0.1)
    else:
        raise AssertionError('Production server did not become ready')

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context()
        # No real geolocation or third-party browsing is needed for this check.
        context.route('**/*', lambda route: route.continue_() if urlsplit(route.request.url).netloc == f'127.0.0.1:{port}' else route.abort())
        page = context.new_page()
        page.on('pageerror', lambda error: page_errors.append(str(error)))
        response = context.request.post(base + '/api/ai/search-conversation', data={'action': 'start'})
        assert response.status == 503, 'Unfinished conversation API must be unavailable'
        assert response.json()['code'] == 'FEATURE_UNAVAILABLE'
        page.goto(base + '/events')
        expect(page.get_by_role('heading', name='Discover Events')).to_be_visible()
        expect(page.get_by_placeholder('Search events...', exact=True)).to_be_visible()
        page.get_by_role('button', name='Ask AI Assistant').click()
        expect(page.get_by_role('dialog').get_by_role('alert')).to_have_text('AI assistant is temporarily unavailable. Please try again later.')
        expect(page.get_by_role('textbox', name='Message', exact=True)).to_be_disabled()
        expect(page.get_by_role('button', name='Start voice input', exact=True)).to_be_disabled()
        expect(page.get_by_role('button', name='Send message', exact=True)).to_be_disabled()
        assert not page_errors, f'Browser page errors: {page_errors}'
        page.get_by_role('button', name='Close', exact=True).click()
        expect(page.get_by_role('dialog')).not_to_be_visible()
        expect(page.get_by_role('heading', name='Discover Events')).to_be_visible()
        expect(page.get_by_placeholder('Search events...', exact=True)).to_be_visible()
        page.goto(base + '/events/fixture-event/design')
        expect(page.get_by_role('alert').filter(has_text='Design tools are temporarily unavailable. Please try again later.')).to_be_visible()
        assert not page_errors, f'Browser page errors: {page_errors}'
        print('BROWSER_VERSION', browser.version)
        browser.close()
    print('BROWSER_CONTAINMENT_VERIFIED')
except Exception:
    if page_errors:
        print('BROWSER_PAGE_ERRORS', page_errors)
    raise
finally:
    server.terminate()
    try:
        server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill()
        server.wait(timeout=10)
