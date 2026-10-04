import {
  buildCoverageCacheKey,
  getCoverageCache,
  setCoverageCache,
} from '../coverageCache';

const FINAL_PATH = 'api/v2/devices/network-coverage/';

describe('buildCoverageCacheKey', () => {
  it('gives different keys for a value containing delimiters vs separate params', () => {
    const singleParam = new URLSearchParams('search=Uganda%26tenant%3Dfoo');
    const twoParams = new URLSearchParams('search=Uganda&tenant=foo');

    expect(buildCoverageCacheKey(FINAL_PATH, singleParam)).not.toBe(
      buildCoverageCacheKey(FINAL_PATH, twoParams),
    );
  });

  it('ignores the token parameter', () => {
    const withoutToken = new URLSearchParams('search=Uganda&page=2');
    const withToken = new URLSearchParams('search=Uganda&page=2&token=secret');

    expect(buildCoverageCacheKey(FINAL_PATH, withToken)).toBe(
      buildCoverageCacheKey(FINAL_PATH, withoutToken),
    );
  });

  it('is insensitive to parameter insertion order', () => {
    const ordered = new URLSearchParams('search=Uganda&page=2&limit=10');
    const reordered = new URLSearchParams('limit=10&search=Uganda&page=2');

    expect(buildCoverageCacheKey(FINAL_PATH, ordered)).toBe(
      buildCoverageCacheKey(FINAL_PATH, reordered),
    );
  });

  it('returns finalPath unchanged when there are no params', () => {
    expect(buildCoverageCacheKey(FINAL_PATH, new URLSearchParams())).toBe(
      FINAL_PATH,
    );
    // token alone must not introduce a query string either.
    expect(
      buildCoverageCacheKey(FINAL_PATH, new URLSearchParams('token=secret')),
    ).toBe(FINAL_PATH);
  });

  it('percent-encodes delimiters inside values', () => {
    const key = buildCoverageCacheKey(
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

describe('coverage cache store', () => {
  it('stores and returns entries for 2xx statuses only', () => {
    const key = 'coverage-cache-store-test';
    const body = { results: [{ id: 1 }] };

    setCoverageCache(key, body, 500);
    expect(getCoverageCache(key)).toBeUndefined();

    setCoverageCache(key, body, 200);
    expect(getCoverageCache(key)).toEqual({
      body,
      status: 200,
      storedAt: expect.any(Number),
    });
    expect(getCoverageCache('coverage-cache-store-test-miss')).toBeUndefined();
  });
});
