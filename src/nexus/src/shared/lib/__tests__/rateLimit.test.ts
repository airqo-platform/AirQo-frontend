/**
 * @jest-environment node
 */

// Test the rate limiter directly. Since it uses an in-memory store that
// persists across calls within the same process, we test the behavior
// by making sequential calls and verifying the token bucket semantics.

import { checkRateLimit, getClientIp } from '../rateLimit';

describe('checkRateLimit', () => {
  it('allows first request within window', () => {
    const result = checkRateLimit('test-ip-fresh', {
      windowMs: 60_000,
      maxRequests: 5,
    });

    expect(result.allowed).toBe(true);
    expect(result.retryAfterMs).toBe(0);
  });

  it('rejects when limit is exceeded', () => {
    const identifier = 'test-ip-exhaust';

    // Exhaust the limit
    for (let i = 0; i < 5; i++) {
      checkRateLimit(identifier, { windowMs: 60_000, maxRequests: 5 });
    }

    // Next request should be rejected
    const result = checkRateLimit(identifier, {
      windowMs: 60_000,
      maxRequests: 5,
    });
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('different identifiers have separate limits', () => {
    // Exhaust limit for shared-ip-a
    for (let i = 0; i < 6; i++) {
      checkRateLimit('shared-ip-a', { windowMs: 60_000, maxRequests: 5 });
    }

    // shared-ip-b should still be allowed
    const result = checkRateLimit('shared-ip-b', {
      windowMs: 60_000,
      maxRequests: 5,
    });
    expect(result.allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  it('returns first IP from x-forwarded-for', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(request)).toBe('1.2.3.4');
  });

  it('returns x-real-ip when no x-forwarded-for', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.8.7.6' },
    });
    expect(getClientIp(request)).toBe('9.8.7.6');
  });

  it('returns unknown when no IP headers', () => {
    const request = new Request('http://localhost');
    expect(getClientIp(request)).toBe('unknown');
  });
});
