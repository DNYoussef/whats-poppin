import { afterEach, expect, it, vi } from 'vitest';

const hooks = vi.hoisted(() => ({
  effects: [] as Array<() => void | (() => void)>,
  deps: [] as unknown[],
}));
vi.mock('react', async (original) => ({
  ...await original<typeof import('react')>(),
  useState: (value: unknown) => [value, vi.fn()],
  useCallback: (fn: unknown) => fn,
  useEffect: (effect: () => void | (() => void), deps: unknown[]) => {
    hooks.effects.push(effect);
    hooks.deps = deps;
  },
}));
import { SearchBar } from '@/components/events/SearchBar';

afterEach(() => { vi.useRealTimers(); hooks.effects.length = 0; });

it('delays search and cancels obsolete work on cleanup', () => {
  vi.useFakeTimers();
  const search = vi.fn();
  SearchBar({ onSearch: search, initialValue: 'old-city', debounceMs: 50 });
  expect(hooks.deps).toEqual(['old-city', search, 50]);
  const cleanup = hooks.effects.pop()!();
  vi.advanceTimersByTime(49);
  expect(search).not.toHaveBeenCalled();
  expect(cleanup).toBeTypeOf('function');
  cleanup!();
  const nextSearch = vi.fn();
  SearchBar({ onSearch: nextSearch, initialValue: 'new-city', debounceMs: 80 });
  expect(hooks.deps).toEqual(['new-city', nextSearch, 80]);
  const unmount = hooks.effects.pop()!();
  vi.advanceTimersByTime(79);
  expect(nextSearch).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(search).not.toHaveBeenCalled();
  expect(nextSearch.mock.calls).toEqual([['new-city']]);
  unmount!();
  SearchBar({ onSearch: search, initialValue: 'unmounted-city', debounceMs: 50 });
  hooks.effects.pop()!()?.();
  vi.runAllTimers();
  expect(search).not.toHaveBeenCalled();
  expect(nextSearch.mock.calls).toEqual([['new-city']]);
});
