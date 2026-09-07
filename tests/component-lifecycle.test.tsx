import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ id: 'event-a', getEvent: vi.fn() }));
vi.mock('next/navigation', () => ({ useParams: () => ({ id: state.id }), useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/dynamic', () => ({ default: () => () => null }));
vi.mock('@/lib/events', () => ({ getEvent: state.getEvent }));
vi.mock('@/components/ui/dialog', () => {
  const Part = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  return { Dialog: Part, DialogContent: Part, DialogHeader: Part, DialogTitle: Part };
});
import EventDetail from '@/app/events/[id]/page';
import DesignPreview from '@/app/events/[id]/design/page';
import { RecommendedEvents } from '@/components/recommendations/RecommendedEvents';
import { AIAssistant } from '@/components/events/AIAssistant';

let tree: ReactTestRenderer | undefined;
let fetchMock: ReturnType<typeof vi.fn>;
async function render(element: React.ReactElement) {
  await act(async () => {
    if (tree) tree.update(element);
    else tree = create(element);
  });
}
beforeEach(() => {
  state.id = 'event-a';
  state.getEvent.mockReset().mockResolvedValue(null);
  fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ designs: [], recommendations: [], messages: [{ role: 'assistant', content: 'fixture greeting' }] }) });
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('window', {});
});
afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
  vi.unstubAllGlobals();
});

it('event detail reloads only when the event ID changes', async () => {
  await render(<EventDetail />);
  await render(<EventDetail />);
  expect(state.getEvent.mock.calls).toEqual([['event-a']]);
  state.id = 'event-b';
  await render(<EventDetail />);
  expect(state.getEvent.mock.calls).toEqual([['event-a'], ['event-b']]);
});

it('design requests follow the event ID, not params object identity', async () => {
  await render(<DesignPreview params={{ id: 'event-a' }} />);
  await render(<DesignPreview params={{ id: 'event-a' }} />);
  await render(<DesignPreview params={{ id: 'event-b' }} />);
  expect(fetchMock.mock.calls.map(([url, options]) => [url, JSON.parse(options.body)])).toEqual([
    ['/api/ai/generate-design', { eventId: 'event-a' }],
    ['/api/ai/generate-design', { eventId: 'event-b' }],
  ]);
});

it('recommendations reload for user and limit changes without a render loop', async () => {
  await render(<RecommendedEvents userId="user-a" limit={5} />);
  await render(<RecommendedEvents userId="user-a" limit={5} />);
  await render(<RecommendedEvents userId="user-b" limit={5} />);
  await render(<RecommendedEvents userId="user-b" limit={7} />);
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
    '/api/recommendations?userId=user-a&limit=5&fresh=false',
    '/api/recommendations?userId=user-b&limit=5&fresh=false',
    '/api/recommendations?userId=user-b&limit=7&fresh=false',
  ]);
});

it('assistant starts once per opening, not on unrelated renders', async () => {
  await render(<AIAssistant isOpen={false} onClose={() => {}} />);
  expect(fetchMock).not.toHaveBeenCalled();
  await render(<AIAssistant isOpen onClose={() => {}} />);
  await render(<AIAssistant isOpen onClose={() => {}} />);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await render(<AIAssistant isOpen={false} onClose={() => {}} />);
  await render(<AIAssistant isOpen onClose={() => {}} />);
  expect(fetchMock.mock.calls.map(([url, options]) => [url, JSON.parse(options.body)])).toEqual([
    ['/api/ai/search-conversation', { action: 'start' }],
    ['/api/ai/search-conversation', { action: 'start' }],
  ]);
});
