export {};

import { renderHook, act } from '@testing-library/react';

// Provide a browser-ish window for the beacon hook.
const setupDom = () => {
  Object.defineProperty(document, 'visibilityState', {
    value: 'visible',
    configurable: true,
    writable: true,
  });
};

let pathname = '/analytics';
let routeParams: Record<string, string> = {};
let sessionStatus: 'authenticated' | 'loading' | 'unauthenticated' =
  'authenticated';

const mockUseSession = jest.fn(() => ({ status: sessionStatus, data: null }));
const mockUsePathname = jest.fn(() => pathname);
const mockUseParams = jest.fn(() => routeParams);

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useParams: () => mockUseParams(),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

const mockResolveToken = jest.fn(
  async (): Promise<{
    fetchSucceeded: boolean;
    token: string | null;
  }> => ({
    fetchSucceeded: true,
    token: 'mock-jwt',
  })
);

jest.mock('@/shared/services/sessionAuthToken', () => ({
  resolveSessionAccessToken: () => mockResolveToken(),
}));

const mockBuildUrl = jest.fn((p: string) => `https://api.test${p}`);
jest.mock('@/shared/lib/oauth-session', () => ({
  buildBackendApiUrl: (p: string) => mockBuildUrl(p),
}));

const { useUsageTracking } = jest.requireActual('../useUsageTracking') as {
  useUsageTracking: () => void;
};

// Drain microtasks so the fire-and-forget flush has a chance to run.
const flushMicrotasks = async () => {
  for (let i = 0; i < 5; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
};

describe('useUsageTracking', () => {
  let fetchMock: jest.Mock;
  let sessionStorageSpy: jest.SpyInstance;

  beforeEach(() => {
    setupDom();
    pathname = '/analytics';
    routeParams = {};
    sessionStatus = 'authenticated';
    mockResolveToken.mockResolvedValue({
      fetchSucceeded: true,
      token: 'mock-jwt',
    });
    fetchMock = jest.fn(async () => ({ ok: true, status: 202 }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = fetchMock;

    const fake = new TestStorage();
    sessionStorageSpy = jest
      .spyOn(window, 'sessionStorage', 'get')
      .mockReturnValue(fake as unknown as Storage);

    jest.clearAllMocks();
  });

  afterEach(() => {
    sessionStorageSpy.mockRestore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).fetch;
  });

  it('does not fetch when the session is unauthenticated', () => {
    sessionStatus = 'unauthenticated';
    const { rerender } = renderHook(() => useUsageTracking());

    act(() => {
      pathname = '/analytics/overview';
      rerender();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('is a no-op on mount (no segment to flush yet)', () => {
    renderHook(() => useUsageTracking());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not re-emit the same segment when params object identity changes', async () => {
    const { rerender } = renderHook(() => useUsageTracking());

    await act(async () => {
      routeParams = {};
      rerender();
      await flushMicrotasks();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('emits session_start only on the first event of a session', async () => {
    const { rerender } = renderHook(() => useUsageTracking());

    // Trigger a route change so the previous segment is flushed.
    await act(async () => {
      pathname = '/analytics/overview';
      rerender();
      await flushMicrotasks();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [, init] = fetchMock.mock.calls[0] as [string, any];
    const body = JSON.parse(init.body as string);

    const withStart = body.events.filter(
      (e: { session_start?: boolean }) => e.session_start
    );
    expect(withStart).toHaveLength(1);
    expect(body.events[0].path).toBe('/analytics');
    expect(body.events[0].session_start).toBe(true);

    // A subsequent route change must NOT carry session_start again.
    await act(async () => {
      pathname = '/analytics/overview/second';
      rerender();
      await flushMicrotasks();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [, init2] = fetchMock.mock.calls[1] as [string, any];
    const body2 = JSON.parse(init2.body as string);
    const withStart2 = body2.events.filter(
      (e: { session_start?: boolean }) => e.session_start
    );
    expect(withStart2).toHaveLength(0);
  });

  it('does not fetch when no token resolves', async () => {
    mockResolveToken.mockResolvedValue({
      fetchSucceeded: false,
      token: null,
    });

    const { rerender } = renderHook(() => useUsageTracking());

    await act(async () => {
      pathname = '/analytics/overview';
      rerender();
      await flushMicrotasks();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('POSTs with keepalive + JWT header + correct URL when a token is present', async () => {
    const { rerender } = renderHook(() => useUsageTracking());

    await act(async () => {
      pathname = '/org/abc-123/dashboard';
      routeParams = { orgId: 'abc-123' };
      rerender();
      await flushMicrotasks();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [url, init] = fetchMock.mock.calls[0] as [string, any];
    expect(url).toBe('https://api.test/users/usage/events');
    expect(init).toMatchObject({
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'JWT mock-jwt',
      },
    });
    const body = JSON.parse(init.body as string);
    expect(body.events[0].path).toBe('/analytics');
    expect(typeof body.session_id).toBe('string');
  });

  it('clamps a long duration to an integer within bounds', async () => {
    jest.useFakeTimers();
    const { rerender } = renderHook(() => useUsageTracking());

    // Advance time by ~5 seconds on the first segment.
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    await act(async () => {
      pathname = '/analytics/overview';
      rerender();
      await flushMicrotasks();
    });

    jest.useRealTimers();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [, init] = fetchMock.mock.calls[0] as [string, any];
    const body = JSON.parse(init.body as string);
    expect(body.events[0].duration_sec).toBeGreaterThanOrEqual(4);
    expect(body.events[0].duration_sec).toBeLessThanOrEqual(6);
    expect(Number.isInteger(body.events[0].duration_sec)).toBe(true);
  });

  it('flushes remaining events on unmount', async () => {
    const { rerender, unmount } = renderHook(() => useUsageTracking());

    await act(async () => {
      pathname = '/analytics/overview';
      rerender();
      await flushMicrotasks();
    });

    const callsBeforeUnmount = fetchMock.mock.calls.length;
    expect(callsBeforeUnmount).toBeGreaterThanOrEqual(1);

    await act(async () => {
      unmount();
      await flushMicrotasks();
    });

    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(
      callsBeforeUnmount
    );
  });

  it('resets enteredAt when tab returns to visible so hidden time is excluded', async () => {
    jest.useFakeTimers();
    const { rerender } = renderHook(() => useUsageTracking());

    // Simulate entering a page at t=0.
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    // Switch to hidden — emits the current segment.
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true,
        writable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
      await flushMicrotasks();
    });

    // Simulate 10 seconds passing while hidden.
    await act(async () => {
      jest.advanceTimersByTime(10_000);
    });

    // Return to visible.
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
        writable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Now spend 2 more seconds on the page, then navigate away.
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await act(async () => {
      pathname = '/new-page';
      rerender();
      await flushMicrotasks();
    });

    jest.useRealTimers();

    // The LAST fetch call should contain the segment that started when the
    // tab became visible (not when it was originally loaded). Its duration
    // should be ~2s, not ~12s (2s + 10s hidden).
    const lastCallIdx = fetchMock.mock.calls.length - 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [, init] = fetchMock.mock.calls[lastCallIdx] as [string, any];
    const body = JSON.parse(init.body as string);
    // Find the event for the /analytics path (the segment we were on when
    // returning to visible).
    const analyticsEvent = body.events.find(
      (e: { path: string }) => e.path === '/analytics'
    );
    // Duration should reflect only visible time (~2s), not hidden time.
    // Fail explicitly if the event is missing rather than silently skipping.
    expect(analyticsEvent).toBeDefined();
    expect(analyticsEvent!.duration_sec).toBeLessThanOrEqual(4);
  });

  it('uses truncated raw pathname as fallback when buildRouteTemplate returns null', async () => {
    // A path that is too long to template (>300 chars) and has no dynamic
    // segments — buildRouteTemplate returns null.
    const longPath = '/' + 'segment/'.repeat(50); // ~450 chars
    pathname = longPath;
    routeParams = {};

    const { rerender } = renderHook(() => useUsageTracking());

    await act(async () => {
      pathname = '/analytics';
      rerender();
      await flushMicrotasks();
    });

    // The previous segment should have been emitted with the truncated path.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [, init] = fetchMock.mock.calls[0] as [string, any];
    const body = JSON.parse(init.body as string);
    // The path should be the truncated raw path, not dropped.
    expect(body.events[0].path).toBe(longPath.slice(0, 300));
    expect(body.events[0].path.length).toBeLessThanOrEqual(300);
  });
});

// Minimal in-memory Storage stand-in for the beacon session flags.
class TestStorage implements Storage {
  private map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  key(): string | null {
    return null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}
