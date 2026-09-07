import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { GET as embeddings } from '@/app/api/cron/update-embeddings/route';
import { GET as recommendations } from '@/app/api/cron/update-recommendations/route';

const calls = vi.hoisted(() => ({
  events: vi.fn(), generate: vi.fn(), save: vi.fn(), cleanup: vi.fn(),
  database: vi.fn(), recommend: vi.fn(),
}));
vi.mock('@/lib/ai/database', () => ({
  getEventsWithoutEmbeddings: calls.events,
  batchSaveEventEmbeddings: calls.save,
  deleteExpiredRecommendations: calls.cleanup,
}));
vi.mock('@/lib/ai/embeddings', () => ({ batchGenerateEventEmbeddings: calls.generate }));
vi.mock('@/lib/database', () => ({ getSupabase: calls.database }));
vi.mock('@/lib/ai/recommendations', () => ({ updateEventRecommendations: calls.recommend }));

beforeEach(() => {
  vi.resetAllMocks();
  calls.events.mockResolvedValue([{ id: 'event-canary', title: 'Test event' }]);
  calls.generate.mockResolvedValue([[0.1, 0.2]]);
  calls.save.mockResolvedValue(1);
  calls.cleanup.mockResolvedValue(2);
  const query = {
    select: vi.fn().mockReturnThis(), gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [{ user_id: 'user-canary' }], error: null }),
  };
  calls.database.mockReturnValue({ from: vi.fn().mockReturnValue(query) });
  calls.recommend.mockResolvedValue(undefined);
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

for (const [name, handler] of [['embeddings', embeddings], ['recommendations', recommendations]] as const) {
  describe(`${name} cron authorization`, () => {
    it.each([
      [undefined, undefined], [undefined, 'Bearer undefined'], ['', 'Bearer'],
      ['   ', 'Bearer    '], ['real-secret', undefined], ['real-secret', 'Bearer wrong-secret'],
    ])('rejects secret=%s header=%s before work', async (secret, header) => {
      vi.stubEnv('CRON_SECRET', secret ?? '');
      if (secret === undefined) delete process.env.CRON_SECRET;
      const request = new NextRequest('http://localhost/api/cron/test', {
        headers: header === undefined ? {} : { authorization: header },
      });
      // Real HTTP Headers trims outer whitespace; a blank secret cannot match it.
      if (secret === '   ') expect(request.headers.get('authorization')).toBe('Bearer');
      const response = await handler(request);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
      for (const spy of Object.values(calls)) expect(spy).not.toHaveBeenCalled();
    });

    it.each(['real-secret', randomUUID()])('allows configured credential %s and completes work', async (secret) => {
      vi.stubEnv('CRON_SECRET', secret);
      const response = await handler(new NextRequest('http://localhost/api/cron/test', {
        headers: { authorization: `Bearer ${secret}` },
      }));
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.processed).toBe(1);
      if (name === 'embeddings') {
        expect(calls.events).toHaveBeenCalledWith(200);
        expect(calls.save).toHaveBeenCalledWith(new Map([['event-canary', [0.1, 0.2]]]));
      } else {
        expect(result.deleted).toBe(2);
        expect(calls.recommend).toHaveBeenCalledWith('user-canary');
      }
    });

    it('handles a downstream failure after valid authorization', async () => {
      vi.stubEnv('CRON_SECRET', 'real-secret');
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      calls.events.mockRejectedValue(new Error('fixture database failure'));
      calls.cleanup.mockRejectedValue(new Error('fixture database failure'));
      const response = await handler(new NextRequest('http://localhost/api/cron/test', {
        headers: { authorization: 'Bearer real-secret' },
      }));
      expect(response.status).toBe(500);
      expect((await response.json()).error).toMatch(/^Failed to /);
    });
  });
}
