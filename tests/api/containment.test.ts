/// <reference types="vite/client" />
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const provider = vi.hoisted(() => vi.fn(() => { throw new Error('Provider invocation blocked by fixture'); }));
const database = vi.hoisted(() => vi.fn(() => { throw new Error('Database invocation blocked by fixture'); }));
vi.mock('@/lib/openai', () => ({ getOpenAIClient: provider, openai: { get chat() { return provider(); }, get embeddings() { return provider(); } } }));
vi.mock('@/lib/database', () => ({ getSupabase: database }));
type Handler = (request: NextRequest, context: { params: { id: string } }) => Promise<Response>;
const routes = import.meta.glob<Record<string, Handler>>('/src/app/api/**/route.ts');
// The independent AST inventory test requires this table to match every export.
const policies = [...readFileSync('docs/crucible-20260907/phases/P00/API-POLICY.md', 'utf8').matchAll(/^\| (GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) \| (\/api\/[^ ]+) \|/gm)];
const validBody = JSON.stringify({
  action: 'continue', messages: [{ role: 'user', content: 'Fixture request' }],
  userId: 'forged-user', eventId: 'fixture-event', title: 'Fixture event', description: 'Fixture description',
  category: 'music', tags: [], categories: ['music'], interests: ['fixture'], type: 'viewed',
  preferences: {}, feedback: 'Fixture feedback', design: { theme: 'Minimal', spec: {} },
  events: [{ id: 'fixture-event', title: 'Fixture event', description: 'Fixture description' }],
});
it('discovers the real API route tree', () => {
  expect(policies.length).toBeGreaterThan(0);
  expect(Object.keys(routes)).toContain('/src/app/api/health/route.ts');
  expect(Object.keys(routes)).toContain('/src/app/api/ai/search-conversation/route.ts');
});
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('CRON_SECRET', 'containment-fixture');
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected network request'); }));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

for (const [, method, route] of policies) {
  const headers = route!.startsWith('/api/cron/') ? ['Bearer containment-fixture'] : [undefined, 'Bearer containment-fixture'];
  const bodies = ['GET', 'HEAD'].includes(method!) ? [undefined] : ['{malformed-body', validBody];
  for (const authorization of headers) for (const body of bodies) {
    it(`${method} ${route} is contained: ${authorization ? 'credential' : 'anonymous'}, ${body === validBody ? 'valid' : body ? 'malformed' : 'no'} body`, async () => {
      const load = routes[`/src/app${route}/route.ts`];
      expect(load).toBeTypeOf('function');
      const handlers = await load!();
      expect(handlers[method!]).toBeTypeOf('function');
      const request = new NextRequest('http://localhost/api/fixture?userId=forged-user&limit=3&fresh=true', {
        method, headers: authorization ? { authorization } : {}, ...(body === undefined ? {} : { body }),
      });
      const readBody = vi.spyOn(request, 'json');
      const response = await handlers[method!]!(request, { params: { id: 'fixture-event' } });
      if (route === '/api/health') {
        expect(response.status).toBe(200);
        expect((await response.json()).status).toBe('healthy');
      } else {
        expect(response.status).toBe(503);
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(await response.json()).toEqual({ error: 'This feature is temporarily unavailable.', code: 'FEATURE_UNAVAILABLE' });
      }
      expect(readBody).not.toHaveBeenCalled();
      expect(provider).not.toHaveBeenCalled();
      expect(database).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });
  }
}

it.each([['provider', provider], ['database', database]] as const)('the no-%s-work oracle rejects an invoked dependency', (_name, call) => {
  expect(call).not.toHaveBeenCalled();
  expect(() => call()).toThrow('invocation blocked');
  expect(() => expect(call).not.toHaveBeenCalled()).toThrow();
});
