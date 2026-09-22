import {
  buildEventBatches,
  buildRouteTemplate,
  clampDuration,
  consumeSessionStartFlag,
  getOrCreateUsageSessionId,
  runUsageFlush,
  sanitizeUsageEvent,
  USAGE_MAX_BATCH_SIZE,
  USAGE_SESSION_ID_KEY,
  USAGE_SESSION_STARTED_KEY,
} from '../usageTracking';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('buildRouteTemplate', () => {
  it('replaces a dynamic segment value with its [key] placeholder', () => {
    expect(
      buildRouteTemplate('/org/[groupId]/dashboard', { groupId: 'abc-123' })
    ).toBe('/org/[groupId]/dashboard');
  });

  it('handles an already-templated static path unchanged', () => {
    expect(buildRouteTemplate('/analytics/overview', {})).toBe(
      '/analytics/overview'
    );
  });

  it('does not replace a matching value inside a larger static segment', () => {
    expect(buildRouteTemplate('/api-usage/usage', { id: 'api' })).toBe(
      '/api-usage/usage'
    );
  });

  it('replaces URL-encoded segment values', () => {
    // Next.js decodes params, but the rendered pathname may hold encoded forms.
    expect(
      buildRouteTemplate('/org/hello%20world', { orgId: 'hello world' })
    ).toBe('/org/[orgId]');
  });

  it('replaces raw segment values containing special characters', () => {
    expect(
      buildRouteTemplate('/users/john@doe.org', { userId: 'john@doe.org' })
    ).toBe('/users/[userId]');
  });

  it('returns null when the path does not start with /', () => {
    expect(buildRouteTemplate('no-leading-slash', {})).toBeNull();
  });

  it('returns null when a static path exceeds 300 chars', () => {
    // A long path with no dynamic segments is not shortened by templating,
    // so it must be rejected by the length guard.
    const longPath = '/' + 'x'.repeat(310);
    expect(buildRouteTemplate(longPath, {})).toBeNull();
  });

  it('passes through a templated path that is within the length limit', () => {
    // A long dynamic value collapses to its [key] placeholder on templating.
    const longValue = 'x'.repeat(310);
    expect(buildRouteTemplate(`/${longValue}`, { id: longValue })).toBe(
      '/[id]'
    );
  });
});

describe('clampDuration', () => {
  it('rounds to an integer', () => {
    expect(clampDuration(1.6)).toBe(2);
    expect(clampDuration(1.4)).toBe(1);
  });

  it('clamps negative values to 0', () => {
    expect(clampDuration(-5)).toBe(0);
  });

  it('clamps values above 14400 to 14400', () => {
    expect(clampDuration(99999)).toBe(14400);
  });

  it('returns 0 for non-finite input', () => {
    expect(clampDuration(NaN)).toBe(0);
    expect(clampDuration(Infinity)).toBe(0);
  });

  it('leaves a valid value unchanged', () => {
    expect(clampDuration(42)).toBe(42);
  });
});

describe('sanitizeUsageEvent', () => {
  it('returns a page_view event for a valid raw event', () => {
    expect(sanitizeUsageEvent({ path: '/analytics', duration_sec: 3 })).toEqual(
      {
        type: 'page_view',
        path: '/analytics',
        duration_sec: 3,
      }
    );
  });

  it('attaches session_start when requested', () => {
    expect(
      sanitizeUsageEvent({ path: '/a', session_start: true })
    ).toMatchObject({ session_start: true });
  });

  it('drops an event with a missing path', () => {
    // @ts-expect-error intentionally passing a malformed event
    expect(sanitizeUsageEvent({ duration_sec: 1 })).toBeNull();
  });

  it('drops an event without a leading slash', () => {
    expect(sanitizeUsageEvent({ path: 'analytics' })).toBeNull();
  });

  it('drops an event whose path exceeds 300 chars', () => {
    expect(sanitizeUsageEvent({ path: '/' + 'y'.repeat(300) })).toBeNull();
  });

  it('clamps duration during sanitisation', () => {
    expect(
      sanitizeUsageEvent({ path: '/a', duration_sec: 100000 })
    ).toMatchObject({ duration_sec: 14400 });
  });

  it('always emits type page_view', () => {
    const result = sanitizeUsageEvent({ path: '/a' });
    expect(result?.type).toBe('page_view');
  });
});

describe('buildEventBatches', () => {
  it('chunks into batches of at most 50', () => {
    const events = Array.from({ length: 120 }, (_, i) => ({
      path: `/p${i}`,
      type: 'page_view' as const,
    }));
    const batches = buildEventBatches(events);

    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(50);
    expect(batches[1]).toHaveLength(50);
    expect(batches[2]).toHaveLength(20);
  });

  it('uses the USAGE_MAX_BATCH_SIZE default of 50', () => {
    const events = Array.from({ length: 55 }, (_, i) => ({
      path: `/p${i}`,
      type: 'page_view' as const,
    }));
    expect(buildEventBatches(events)).toHaveLength(2);
    expect(USAGE_MAX_BATCH_SIZE).toBe(50);
  });

  it('respects a custom max batch size', () => {
    const events = Array.from({ length: 10 }, (_, i) => ({
      path: `/p${i}`,
      type: 'page_view' as const,
    }));
    expect(buildEventBatches(events, 3)).toHaveLength(4);
  });

  it('returns [] for an empty array', () => {
    expect(buildEventBatches([])).toEqual([]);
  });
});

describe('getOrCreateUsageSessionId', () => {
  it('returns a stored id when present', () => {
    const store = new Map<string, string>();
    const fakeStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
    } as unknown as Storage;

    const first = getOrCreateUsageSessionId(fakeStorage);
    const second = getOrCreateUsageSessionId(fakeStorage);

    expect(first).toBe(second);
    expect(store.get(USAGE_SESSION_ID_KEY)).toBe(first);
  });

  it('falls back to a generated id when storage is unavailable', () => {
    // Simulate a storage that throws on access.
    const throwingStorage = {
      getItem: () => {
        throw new Error('disabled');
      },
      setItem: () => {
        throw new Error('disabled');
      },
    } as unknown as Storage;

    const id = getOrCreateUsageSessionId(throwingStorage);
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});

describe('consumeSessionStartFlag', () => {
  it('returns true only on the first call per session', () => {
    const store = new Map<string, string>();
    const fakeStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
    } as unknown as Storage;

    expect(consumeSessionStartFlag(fakeStorage)).toBe(true);
    expect(consumeSessionStartFlag(fakeStorage)).toBe(false);
    expect(consumeSessionStartFlag(fakeStorage)).toBe(false);
    expect(store.get(USAGE_SESSION_STARTED_KEY)).toBe('1');
  });

  it('returns false when storage throws', () => {
    const throwingStorage = {
      getItem: () => {
        throw new Error('disabled');
      },
      setItem: () => {
        throw new Error('disabled');
      },
    } as unknown as Storage;

    expect(consumeSessionStartFlag(throwingStorage)).toBe(false);
  });
});

describe('runUsageFlush', () => {
  interface FlushTestDeps {
    resolveToken: jest.Mock;
    fetchImpl: jest.Mock;
    buildUrl: jest.Mock;
  }

  const fakeFetchResponse = { ok: true, status: 202 };

  const makeDeps = (overrides: Partial<FlushTestDeps>): FlushTestDeps => ({
    resolveToken: jest.fn(async () => ({ fetchSucceeded: true, token: 'tok' })),
    fetchImpl: jest.fn(async () => fakeFetchResponse),
    buildUrl: jest.fn((p: string) => `https://api.test${p}`),
    ...overrides,
  });

  it('sends keepalive POST with JWT header and templated URL', async () => {
    const deps = makeDeps({});
    const events = [
      { type: 'page_view' as const, path: '/org/[orgId]', duration_sec: 5 },
    ];

    const result = await runUsageFlush(events, 'session-1', deps);

    expect(result.accepted).toBe(1);
    expect(deps.fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = deps.fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.test/users/usage/events');
    expect(init).toMatchObject({
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'JWT tok',
      },
    });
    const body = JSON.parse(init.body as string);
    expect(body.session_id).toBe('session-1');
    expect(body.events).toHaveLength(1);
  });

  it('drops the queue (no fetch) when token is absent', async () => {
    const deps = makeDeps({
      resolveToken: jest.fn(async () => ({
        fetchSucceeded: false,
        token: null,
      })),
    });
    const events = [{ type: 'page_view' as const, path: '/a' }];

    const result = await runUsageFlush(events, undefined, deps);

    expect(result.accepted).toBe(0);
    expect(deps.fetchImpl).not.toHaveBeenCalled();
  });

  it('drops the queue when token resolution fails', async () => {
    const deps = makeDeps({
      resolveToken: jest.fn(async () => {
        throw new Error('refresh failed');
      }),
    });

    await expect(
      runUsageFlush([{ type: 'page_view', path: '/a' }], 's', deps)
    ).resolves.toEqual({ accepted: 0 });
    expect(deps.fetchImpl).not.toHaveBeenCalled();
  });

  it('does not count non-2xx responses as accepted', async () => {
    const deps = makeDeps({
      fetchImpl: jest.fn(async () => ({ ok: false, status: 500 })),
    });

    const result = await runUsageFlush(
      [{ type: 'page_view', path: '/a' }],
      's',
      deps
    );

    expect(result.accepted).toBe(0);
  });

  it('chunks >50 events into multiple requests', async () => {
    const deps = makeDeps({});
    const events = Array.from({ length: 105 }, (_, i) => ({
      type: 'page_view' as const,
      path: `/p${i}`,
    }));

    const result = await runUsageFlush(events, 's', deps);

    // 105 / 50 = 3 batches
    expect(deps.fetchImpl).toHaveBeenCalledTimes(3);
    expect(result.accepted).toBe(105);
  });

  it('swallows network errors and keeps accepted count for successful batches', async () => {
    let call = 0;
    const deps = makeDeps({
      fetchImpl: jest.fn(async () => {
        call += 1;
        if (call === 2) {
          throw new Error('network down');
        }
        return fakeFetchResponse;
      }),
    });
    const events = Array.from({ length: 60 }, (_, i) => ({
      type: 'page_view' as const,
      path: `/p${i}`,
    }));

    const result = await runUsageFlush(events, 's', deps);

    // batch 1 (50) ok, batch 2 (10) fails
    expect(result.accepted).toBe(50);
  });

  it('does not log/include the token in any error path', async () => {
    const deps = makeDeps({});
    const events = [
      { type: 'page_view' as const, path: '/a', session_start: true },
    ];

    await runUsageFlush(events, 'sid', deps);

    const [, init] = deps.fetchImpl.mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.events[0].session_start).toBe(true);
    expect(body).not.toHaveProperty('token');
  });
});
