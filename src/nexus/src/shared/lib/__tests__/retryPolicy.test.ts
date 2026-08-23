import {
  boundedRetryPolicy,
  getErrorStatus,
  getRetryAfterSeconds,
  isAbortError,
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
