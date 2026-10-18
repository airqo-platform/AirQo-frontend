import {
  buildApiCacheKey,
  getApiCache,
  getApiCachePolicy,
  setApiCache,
} from '../apiCache';

const FINAL_PATH = 'api/v2/devices/network-coverage/';

describe('buildApiCacheKey', () => {
  it('gives different keys for a value containing delimiters vs separate params', () => {
    const singleParam = new URLSearchParams('search=Uganda%26tenant%3Dfoo');
    const twoParams = new URLSearchParams('search=Uganda&tenant=foo');

    expect(buildApiCacheKey(FINAL_PATH, singleParam)).not.toBe(
      buildApiCacheKey(FINAL_PATH, twoParams),
    );
  });

  it('ignores the token parameter', () => {
    const withoutToken = new URLSearchParams('search=Uganda&page=2');
    const withToken = new URLSearchParams('search=Uganda&page=2&token=secret');

    expect(buildApiCacheKey(FINAL_PATH, withToken)).toBe(
      buildApiCacheKey(FINAL_PATH, withoutToken),
    );
  });

  it('is insensitive to parameter insertion order', () => {
    const ordered = new URLSearchParams('search=Uganda&page=2&limit=10');
    const reordered = new URLSearchParams('limit=10&search=Uganda&page=2');

    expect(buildApiCacheKey(FINAL_PATH, ordered)).toBe(
      buildApiCacheKey(FINAL_PATH, reordered),
    );
  });

  it('returns finalPath unchanged when there are no params', () => {
    expect(buildApiCacheKey(FINAL_PATH, new URLSearchParams())).toBe(
      FINAL_PATH,
    );
    // token alone must not introduce a query string either.
    expect(
      buildApiCacheKey(FINAL_PATH, new URLSearchParams('token=secret')),
    ).toBe(FINAL_PATH);
  });

  it('percent-encodes delimiters inside values', () => {
    const key = buildApiCacheKey(
      FINAL_PATH,
      new URLSearchParams('search=Uganda%26tenant%3Dfoo'),
    );

    expect(key).toBe(`${FINAL_PATH}?search=Uganda%26tenant%3Dfoo`);
    expect(key).toContain('%26');
    expect(key).toContain('%3D');
    expect(key).not.toContain('Uganda&tenant');
    expect(key).not.toContain('Uganda=tenant');
  });
});

describe('API cache policy', () => {
  it.each([
    ['devices/network-coverage', 'networkCoverage'],
    [
      'devices/readings/grids/grid-1/representative',
      'gridRepresentativeReading',
    ],
    ['devices/measurements/grids/grid-1/recent', 'gridMeasurements'],
    ['predict/daily-forecast', 'dailyForecast'],
    ['devices/grids/summary', 'gridsSummary'],
  ])('allowlists %s as %s', (path, name) => {
    expect(getApiCachePolicy(path)).toMatchObject({ name });
  });

  it('does not cache unrelated routes', () => {
    expect(
      getApiCachePolicy('devices/readings/grids/grid-1/latest'),
    ).toBeUndefined();
  });
});

describe('API cache store', () => {
  it('stores and returns entries for 2xx statuses only', () => {
    const key = 'api-cache-store-test';
    const body = { results: [{ id: 1 }] };

    setApiCache(key, body, 500, 1000);
    expect(getApiCache(key)).toBeUndefined();

    setApiCache(key, body, 200, 1000);
    expect(getApiCache(key)).toEqual({
      body,
      status: 200,
      storedAt: expect.any(Number),
      ttlMs: 1000,
    });
    expect(getApiCache('api-cache-store-test-miss')).toBeUndefined();
  });
});
