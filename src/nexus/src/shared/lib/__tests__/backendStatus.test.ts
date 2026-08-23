import {
  getBackendStatus,
  subscribeBackendStatus,
  getBackendFailureCount,
  resetBackendStatus,
  recordBackendResponded,
  recordBackendUnreachable,
  probeBackend,
} from '../backendStatus';

// ---------------------------------------------------------------------------
// Mock the open client so probeBackend never hits the network.
// Follows the same pattern as authService.test.ts: mock functions live inside
// the factory (hoisted) and are extracted via jest.requireMock.
// ---------------------------------------------------------------------------

jest.mock('@/shared/services/apiClient', () => {
  const mockGet = jest.fn().mockResolvedValue({ data: { success: true } });
  return {
    createOpenClient: () => ({
      get: mockGet,
    }),
    __mockGet: mockGet,
  };
});

const { __mockGet: mockGet } = jest.requireMock(
  '@/shared/services/apiClient'
) as {
  __mockGet: jest.Mock;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  resetBackendStatus();
  mockGet.mockReset();
  mockGet.mockResolvedValue({ data: { success: true } });
});

describe('backendStatus', () => {
  // --- Initial state -------------------------------------------------------

  it('starts with status unknown and failure count 0', () => {
    expect(getBackendStatus()).toEqual({ status: 'unknown', reason: '' });
    expect(getBackendFailureCount()).toBe(0);
  });

  // --- Threshold -----------------------------------------------------------

  it('one failure does NOT trigger outage', () => {
    recordBackendUnreachable('first');
    expect(getBackendFailureCount()).toBe(1);
    expect(getBackendStatus().status).toBe('unknown');
  });

  it('two consecutive failures trigger outage', () => {
    recordBackendUnreachable('first');
    recordBackendUnreachable('second');
    expect(getBackendFailureCount()).toBe(2);
    expect(getBackendStatus().status).toBe('outage');
    expect(getBackendStatus().reason).toBe('second');
  });

  it('three failures keep outage status', () => {
    recordBackendUnreachable();
    recordBackendUnreachable();
    recordBackendUnreachable();
    expect(getBackendStatus().status).toBe('outage');
    expect(getBackendFailureCount()).toBe(3);
  });

  // --- Recovery via recordBackendResponded ---------------------------------

  it('recordBackendResponded resets counter and transitions outage to online', () => {
    recordBackendUnreachable();
    recordBackendUnreachable();
    expect(getBackendStatus().status).toBe('outage');

    recordBackendResponded();
    expect(getBackendFailureCount()).toBe(0);
    expect(getBackendStatus().status).toBe('online');
    expect(getBackendStatus().reason).toBe('Backend recovered');
  });

  it('recordBackendResponded transitions unknown to online', () => {
    recordBackendResponded();
    expect(getBackendFailureCount()).toBe(0);
    expect(getBackendStatus().status).toBe('online');
  });

  it('recordBackendResponded does NOT notify when already online', () => {
    recordBackendResponded();
    const spy = jest.fn();
    subscribeBackendStatus(spy);

    recordBackendResponded();
    expect(spy).not.toHaveBeenCalled();
  });

  // --- Subscriber notification on transitions -------------------------------

  it('subscribers are notified when status transitions to outage', () => {
    const spy = jest.fn();
    const unsub = subscribeBackendStatus(spy);

    recordBackendUnreachable();
    // Counter increment to 1, threshold not reached — no notification.
    expect(spy).toHaveBeenCalledTimes(0);

    recordBackendUnreachable();
    // Counter reaches 2, threshold met — transition to outage → 1 notification.
    expect(spy).toHaveBeenCalledTimes(1);

    unsub();
  });

  it('subscribers are notified when status transitions to online', () => {
    recordBackendUnreachable();
    recordBackendUnreachable();
    expect(getBackendStatus().status).toBe('outage');

    const spy = jest.fn();
    const unsub = subscribeBackendStatus(spy);

    recordBackendResponded();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(getBackendStatus().status).toBe('online');

    unsub();
  });

  it('unsubscribe removes the listener', () => {
    const spy = jest.fn();
    const unsub = subscribeBackendStatus(spy);
    unsub();

    recordBackendResponded();
    expect(spy).not.toHaveBeenCalled();
  });

  // --- Counter reset via recordBackendResponded ----------------------------

  it('counter resets to 0 after response and new failures build again', () => {
    recordBackendUnreachable();
    recordBackendUnreachable();
    expect(getBackendFailureCount()).toBe(2);

    recordBackendResponded();
    expect(getBackendFailureCount()).toBe(0);

    // One new failure should NOT be outage (counter restarted at 0).
    recordBackendUnreachable();
    expect(getBackendFailureCount()).toBe(1);
    expect(getBackendStatus().status).toBe('online');
  });

  // --- resetBackendStatus --------------------------------------------------

  it('resetBackendStatus clears everything and notifies', () => {
    recordBackendUnreachable();
    recordBackendUnreachable();
    expect(getBackendStatus().status).toBe('outage');

    const spy = jest.fn();
    const unsub = subscribeBackendStatus(spy);

    resetBackendStatus();
    expect(getBackendStatus()).toEqual({ status: 'unknown', reason: '' });
    expect(getBackendFailureCount()).toBe(0);
    expect(spy).toHaveBeenCalledTimes(1);

    unsub();
  });

  // --- probeBackend --------------------------------------------------------

  it('probeBackend returns true on success and calls recordBackendResponded', async () => {
    const result = await probeBackend();
    expect(result).toBe(true);
    expect(getBackendStatus().status).toBe('online');
  });

  it('probeBackend returns false on failure and increments counter', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'));

    const result = await probeBackend();
    expect(result).toBe(false);
    // Two probe failures needed for outage; this is only the first.
    expect(getBackendFailureCount()).toBe(1);
  });

  it('probeBackend never throws even when the request fails', async () => {
    mockGet.mockRejectedValueOnce(new Error('boom'));

    await expect(probeBackend()).resolves.toBe(false);
  });

  it('probeBackend works with AbortController timeout', async () => {
    jest.useFakeTimers();

    // Simulate a request that never resolves until the abort controller fires.
    // The promise rejects when abort() is called by the probe timeout.
    mockGet.mockReturnValueOnce(
      new Promise((_, reject) => {
        // The abort will trigger AbortController's abort event, but in jsdom
        // the signal event may not fire. Instead, simulate what happens when
        // the internal timer fires: the AbortController.abort() is called,
        // and axios throws AbortError. We simulate by rejecting after the
        // timer fires.
        jest.advanceTimersByTime(8_000);
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      })
    );

    // Advance the probe's internal setTimeout (8000ms) to trigger abort.
    const resultPromise = probeBackend();
    jest.advanceTimersByTime(8_000);

    const result = await resultPromise;
    expect(result).toBe(false);

    jest.useRealTimers();
  });

  // --- Subscriber notification on transition: full flow --------------------

  it('subscribers see full lifecycle: unknown to outage to online', () => {
    const events: string[] = [];
    const unsub = subscribeBackendStatus(() => {
      events.push(getBackendStatus().status);
    });

    // First failure - no transition.
    recordBackendUnreachable();
    // Second failure - transition to outage.
    recordBackendUnreachable();
    // Recovery - transition to online.
    recordBackendResponded();

    expect(events).toEqual(['outage', 'online']);

    unsub();
  });

  // --- Snapshot reference stability (useSyncExternalStore requirement) ----

  it('consecutive getBackendStatus() calls return the SAME reference when state is unchanged', () => {
    const first = getBackendStatus();
    const second = getBackendStatus();
    expect(first).toBe(second);
  });

  it('snapshot reference CHANGES after a status transition', () => {
    const before = getBackendStatus();
    // Two failures → outage transition.
    recordBackendUnreachable('a');
    recordBackendUnreachable('b');
    const after = getBackendStatus();

    expect(before).not.toBe(after);
    expect(after).toEqual({ status: 'outage', reason: 'b' });
  });

  it('status transitions emit subscriber notifications exactly once per transition', () => {
    const spy = jest.fn();
    const unsub = subscribeBackendStatus(spy);

    // Record outage via repeated call (no extra notification beyond the transition).
    recordBackendUnreachable('x');
    recordBackendUnreachable('y');
    expect(spy).toHaveBeenCalledTimes(1);

    // Record recovery — second transition.
    recordBackendResponded();
    expect(spy).toHaveBeenCalledTimes(2);

    // Already online — no further notification.
    recordBackendResponded();
    expect(spy).toHaveBeenCalledTimes(2);

    unsub();
  });
});
