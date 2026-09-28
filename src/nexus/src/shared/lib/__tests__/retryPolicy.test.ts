import {
  boundedRetryPolicy,
  swrRetryPolicy,
  getErrorStatus,
  getRetryAfterSeconds,
  isAbortError,
  isNetworkRetryableError,
} from '../retryPolicy';

describe('isAbortError', () => {
  it('detects abort-like errors', () => {
    expect(
      isAbortError(Object.assign(new Error('x'), { name: 'AbortError' }))
    ).toBe(true);
    expect(
      isAbortError(Object.assign(new Error('x'), { code: 'ERR_CANCELED' }))
    ).toBe(true);
    expect(isAbortError(new Error('canceled'))).toBe(true);
  });

  it('ignores ordinary errors', () => {
    expect(isAbortError(new Error('boom'))).toBe(false);
    expect(isAbortError(null)).toBe(false);
    expect(isAbortError(undefined)).toBe(false);
  });
});

describe('getErrorStatus', () => {
  it('reads the status from axios-style error objects', () => {
    expect(getErrorStatus({ response: { status: 429 } })).toBe(429);
    expect(getErrorStatus({ status: 500 })).toBe(500);
    expect(getErrorStatus(new Error('no status'))).toBeNull();
  });
});

describe('getRetryAfterSeconds', () => {
  it('parses delay-seconds', () => {
    expect(
      getRetryAfterSeconds({ response: { headers: { 'retry-after': '30' } } })
    ).toBe(30);
  });

  it('accepts zero seconds (retry immediately)', () => {
    expect(
      getRetryAfterSeconds({ response: { headers: { 'retry-after': '0' } } })
    ).toBe(0);
  });

  it('parses HTTP-date format', () => {
    const future = new Date(Date.now() + 5000).toUTCString();
    const seconds = getRetryAfterSeconds({
      response: { headers: { 'retry-after': future } },
    });
    expect(seconds).not.toBeNull();
    expect(seconds!).toBeGreaterThanOrEqual(4);
    expect(seconds!).toBeLessThanOrEqual(6);
  });

  it('clamps past HTTP-dates to zero', () => {
    const past = new Date(Date.now() - 10000).toUTCString();
    expect(
      getRetryAfterSeconds({ response: { headers: { 'retry-after': past } } })
    ).toBe(0);
  });

  it('returns null for garbage values', () => {
    expect(
      getRetryAfterSeconds({ response: { headers: { 'retry-after': 'soon' } } })
    ).toBeNull();
    expect(getRetryAfterSeconds({})).toBeNull();
    expect(getRetryAfterSeconds(null)).toBeNull();
  });
});

describe('boundedRetryPolicy', () => {
  const makeError = (status: number) => ({ response: { status } });

  it('never retries 5xx errors', () => {
    expect(boundedRetryPolicy.retry(0, makeError(500))).toBe(false);
    expect(boundedRetryPolicy.retry(0, makeError(503))).toBe(false);
  });

  it('never retries abort errors or network failures', () => {
    expect(
      boundedRetryPolicy.retry(
        0,
        Object.assign(new Error('x'), { name: 'AbortError' })
      )
    ).toBe(false);
    expect(
      boundedRetryPolicy.retry(
        0,
        Object.assign(new Error('x'), { code: 'ERR_NETWORK' })
      )
    ).toBe(false);
  });

  it('retries 429 exactly once', () => {
    expect(boundedRetryPolicy.retry(0, makeError(429))).toBe(true);
    expect(boundedRetryPolicy.retry(1, makeError(429))).toBe(false);
  });

  it('does not retry other statuses', () => {
    expect(boundedRetryPolicy.retry(0, makeError(400))).toBe(false);
    expect(boundedRetryPolicy.retry(0, makeError(403))).toBe(false);
  });

  it('uses the Retry-After delay when present, capped at 15s', () => {
    expect(
      boundedRetryPolicy.retryDelay(1, {
        response: { status: 429, headers: { 'retry-after': '5' } },
      })
    ).toBe(5000);

    expect(
      boundedRetryPolicy.retryDelay(1, {
        response: { status: 429, headers: { 'retry-after': '120' } },
      })
    ).toBe(15000);
  });

  it('falls back to exponential backoff without Retry-After', () => {
    expect(boundedRetryPolicy.retryDelay(1, makeError(429))).toBe(2000);
    expect(boundedRetryPolicy.retryDelay(2, makeError(429))).toBe(4000);
  });
});

describe('swrRetryPolicy.shouldRetryOnError', () => {
  const make429 = () =>
    Object.assign(new Error('Too Many Requests'), {
      response: { status: 429 },
    });
  const makeStatus = (s: number) =>
    Object.assign(new Error(`HTTP ${s}`), {
      response: { status: s },
    });

  it('returns true for a 429 error', () => {
    expect(swrRetryPolicy.shouldRetryOnError(make429())).toBe(true);
  });

  it('returns false for 500', () => {
    expect(swrRetryPolicy.shouldRetryOnError(makeStatus(500))).toBe(false);
  });

  it('returns false for 401', () => {
    expect(swrRetryPolicy.shouldRetryOnError(makeStatus(401))).toBe(false);
  });

  it('returns false for 403', () => {
    expect(swrRetryPolicy.shouldRetryOnError(makeStatus(403))).toBe(false);
  });

  it('returns false for 404', () => {
    expect(swrRetryPolicy.shouldRetryOnError(makeStatus(404))).toBe(false);
  });

  it('returns true for ERR_NETWORK (issue #4023)', () => {
    const err = Object.assign(new Error('Network Error'), {
      code: 'ERR_NETWORK',
    });
    expect(swrRetryPolicy.shouldRetryOnError(err)).toBe(true);
  });

  it('returns true for ECONNABORTED, ETIMEDOUT and TimeoutError', () => {
    expect(
      swrRetryPolicy.shouldRetryOnError(
        Object.assign(new Error('aborted'), { code: 'ECONNABORTED' })
      )
    ).toBe(true);
    expect(
      swrRetryPolicy.shouldRetryOnError(
        Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' })
      )
    ).toBe(true);
    expect(
      swrRetryPolicy.shouldRetryOnError(
        Object.assign(new Error('timeout'), { name: 'TimeoutError' })
      )
    ).toBe(true);
  });

  it('classifies a synthesized 500 from a network failure as network-level', () => {
    // Some services synthesize HTTP 500 on network errors — code/name must
    // win over status so the error is still bounded-retried.
    const err = Object.assign(new Error('Network Error'), {
      code: 'ERR_NETWORK',
      response: { status: 500 },
    });
    expect(isNetworkRetryableError(err)).toBe(true);
    expect(swrRetryPolicy.shouldRetryOnError(err)).toBe(true);
  });

  it('returns false for an AbortError', () => {
    const err = Object.assign(new Error('Aborted'), {
      name: 'AbortError',
    });
    expect(swrRetryPolicy.shouldRetryOnError(err)).toBe(false);
  });
});

describe('isNetworkRetryableError', () => {
  it('detects network-level codes and TimeoutError', () => {
    expect(
      isNetworkRetryableError(
        Object.assign(new Error('x'), { code: 'ERR_NETWORK' })
      )
    ).toBe(true);
    expect(
      isNetworkRetryableError(
        Object.assign(new Error('x'), { code: 'ECONNABORTED' })
      )
    ).toBe(true);
    expect(
      isNetworkRetryableError(
        Object.assign(new Error('x'), { code: 'ETIMEDOUT' })
      )
    ).toBe(true);
    expect(
      isNetworkRetryableError(
        Object.assign(new Error('x'), { name: 'TimeoutError' })
      )
    ).toBe(true);
  });

  it('ignores aborts, HTTP statuses and ordinary errors', () => {
    expect(
      isNetworkRetryableError(
        Object.assign(new Error('x'), { name: 'AbortError' })
      )
    ).toBe(false);
    expect(isNetworkRetryableError({ response: { status: 500 } })).toBe(false);
    expect(isNetworkRetryableError(new Error('boom'))).toBe(false);
    expect(isNetworkRetryableError(null)).toBe(false);
    expect(isNetworkRetryableError(undefined)).toBe(false);
  });
});

describe('swrRetryPolicy.onErrorRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('schedules a single revalidate for a 429 with Retry-After, passing opts through', () => {
    const revalidate = jest.fn();
    const error = Object.assign(new Error('Too Many Requests'), {
      response: {
        status: 429,
        headers: { 'retry-after': '2' },
      },
    });

    const opts = { retryCount: 1, dedupe: true } as Required<
      import('swr').RevalidatorOptions
    >;
    swrRetryPolicy.onErrorRetry(
      error,
      'test-key',
      {} as never,
      revalidate as never,
      opts
    );

    // Not called yet — setTimeout is pending.
    expect(revalidate).not.toHaveBeenCalled();

    // Advance past the 2s Retry-After delay.
    jest.advanceTimersByTime(2000);

    expect(revalidate).toHaveBeenCalledTimes(1);
    // Must receive the same opts object (pass-through), not a hard-reset.
    expect(revalidate).toHaveBeenCalledWith(opts);
  });

  it('uses a 1 s fallback when no Retry-After header is present', () => {
    const revalidate = jest.fn();
    const error = Object.assign(new Error('Too Many Requests'), {
      response: { status: 429 },
    });

    const opts = { retryCount: 1, dedupe: true } as Required<
      import('swr').RevalidatorOptions
    >;
    swrRetryPolicy.onErrorRetry(
      error,
      'test-key',
      {} as never,
      revalidate as never,
      opts
    );

    jest.advanceTimersByTime(999);
    expect(revalidate).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(revalidate).toHaveBeenCalledWith(opts);
  });

  it('caps Retry-After at 15 s', () => {
    const revalidate = jest.fn();
    const error = Object.assign(new Error('Too Many Requests'), {
      response: {
        status: 429,
        headers: { 'retry-after': '120' },
      },
    });

    const opts = { retryCount: 1, dedupe: true } as Required<
      import('swr').RevalidatorOptions
    >;
    swrRetryPolicy.onErrorRetry(
      error,
      'test-key',
      {} as never,
      revalidate as never,
      opts
    );

    jest.advanceTimersByTime(14999);
    expect(revalidate).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(revalidate).toHaveBeenCalledTimes(1);
  });

  it('does NOT schedule a retry when retryCount > 1 (already retried once)', () => {
    const revalidate = jest.fn();
    const error = Object.assign(new Error('Too Many Requests'), {
      response: { status: 429 },
    });

    const opts = { retryCount: 2, dedupe: true } as Required<
      import('swr').RevalidatorOptions
    >;
    swrRetryPolicy.onErrorRetry(
      error,
      'test-key',
      {} as never,
      revalidate as never,
      opts
    );

    jest.advanceTimersByTime(10000);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('does NOT call revalidate for a 500 error', () => {
    const revalidate = jest.fn();
    const error = Object.assign(new Error('Server Error'), {
      response: { status: 500 },
    });

    swrRetryPolicy.onErrorRetry(
      error,
      'test-key',
      {} as never,
      revalidate as never,
      { retryCount: 0, errorRetryCount: 0 } as never
    );

    jest.advanceTimersByTime(10000);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('does NOT call revalidate for an AbortError', () => {
    const revalidate = jest.fn();
    const error = Object.assign(new Error('Aborted'), {
      name: 'AbortError',
    });

    swrRetryPolicy.onErrorRetry(
      error,
      'test-key',
      {} as never,
      revalidate as never,
      { retryCount: 0, errorRetryCount: 0 } as never
    );

    jest.advanceTimersByTime(10000);
    expect(revalidate).not.toHaveBeenCalled();
  });

  // --- Network-level retries (issue #4023) --------------------------------

  const makeNetworkError = () =>
    Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' });

  it('schedules a network retry on the first failure (retryCount 1)', () => {
    const revalidate = jest.fn();
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const opts = { retryCount: 1, dedupe: true } as Required<
      import('swr').RevalidatorOptions
    >;

    swrRetryPolicy.onErrorRetry(
      makeNetworkError(),
      'test-key',
      {} as never,
      revalidate as never,
      opts
    );

    // backoff = 1000 * 2^0 = 1000, jitter = floor(0.5 * 250) = 125 → 1125 ms
    jest.advanceTimersByTime(1124);
    expect(revalidate).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(revalidate).toHaveBeenCalledWith(opts);

    randomSpy.mockRestore();
  });

  it('schedules a network retry on the second failure (retryCount 2)', () => {
    const revalidate = jest.fn();
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    const opts = { retryCount: 2, dedupe: true } as Required<
      import('swr').RevalidatorOptions
    >;

    swrRetryPolicy.onErrorRetry(
      makeNetworkError(),
      'test-key',
      {} as never,
      revalidate as never,
      opts
    );

    // backoff = 1000 * 2^1 = 2000, jitter = 0 → 2000 ms
    jest.advanceTimersByTime(1999);
    expect(revalidate).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(revalidate).toHaveBeenCalledTimes(1);

    randomSpy.mockRestore();
  });

  it('does NOT schedule a network retry once retryCount exceeds 2', () => {
    const revalidate = jest.fn();
    const opts = { retryCount: 3, dedupe: true } as Required<
      import('swr').RevalidatorOptions
    >;

    swrRetryPolicy.onErrorRetry(
      makeNetworkError(),
      'test-key',
      {} as never,
      revalidate as never,
      opts
    );

    jest.advanceTimersByTime(10000);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('network retry delay stays within [backoff, backoff + jitter]', () => {
    const revalidate = jest.fn();
    // Max jitter: 0.999 * 250 → 249
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.999);
    const opts = { retryCount: 1, dedupe: true } as Required<
      import('swr').RevalidatorOptions
    >;

    swrRetryPolicy.onErrorRetry(
      makeNetworkError(),
      'test-key',
      {} as never,
      revalidate as never,
      opts
    );

    // Lower bound: pure backoff (1000) is NOT enough when jitter is present.
    jest.advanceTimersByTime(1000);
    expect(revalidate).not.toHaveBeenCalled();

    // Upper bound: backoff + jitter cap (1000 + 250) is enough.
    jest.advanceTimersByTime(250);
    expect(revalidate).toHaveBeenCalledTimes(1);

    randomSpy.mockRestore();
  });

  it('never retries a 5xx error', () => {
    const revalidate = jest.fn();
    const error = Object.assign(new Error('Server Error'), {
      response: { status: 503 },
    });

    swrRetryPolicy.onErrorRetry(
      error,
      'test-key',
      {} as never,
      revalidate as never,
      { retryCount: 0, errorRetryCount: 0 } as never
    );

    jest.advanceTimersByTime(10000);
    expect(revalidate).not.toHaveBeenCalled();
  });
});
