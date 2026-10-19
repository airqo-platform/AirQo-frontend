// ---------------------------------------------------------------------------
// Bounded in-memory TTL cache for safe, shared GET responses.
// Module-level so it survives across requests in a single Node process.
// No Next.js imports here so the cache logic stays unit-testable.
// ---------------------------------------------------------------------------

export interface ApiCacheEntry {
  body: unknown;
  status: number;
  storedAt: number;
  ttlMs: number;
}

export interface ApiCachePolicy {
  name: string;
  ttlMs: number;
}

export const API_CACHE_TTLS = {
  networkCoverage: 5 * 60 * 1000,
  billboardReadings: 15 * 60 * 1000,
  gridsSummary: 15 * 60 * 1000,
  dailyForecast: 60 * 60 * 1000,
} as const;

export const API_CACHE_MAX = 100;

const API_CACHE_POLICIES: Array<{
  name: string;
  pattern: RegExp;
  ttlMs: number;
}> = [
  {
    name: 'networkCoverage',
    pattern: /^devices\/network-coverage(?:\/|$)/,
    ttlMs: API_CACHE_TTLS.networkCoverage,
  },
  {
    name: 'gridRepresentativeReading',
    pattern: /^devices\/readings\/grids\/[^/]+\/representative\/?$/,
    ttlMs: API_CACHE_TTLS.billboardReadings,
  },
  {
    name: 'gridMeasurements',
    pattern: /^devices\/measurements\/grids\/[^/]+\/recent\/?$/,
    ttlMs: API_CACHE_TTLS.billboardReadings,
  },
  {
    name: 'dailyForecast',
    pattern: /^predict\/daily-forecast\/?$/,
    ttlMs: API_CACHE_TTLS.dailyForecast,
  },
  {
    name: 'gridsSummary',
    pattern: /^devices\/grids\/summary\/?$/,
    ttlMs: API_CACHE_TTLS.gridsSummary,
  },
];

const apiCache = new Map<string, ApiCacheEntry>();

export function getApiCachePolicy(
  cleanPath: string,
): ApiCachePolicy | undefined {
  const policy = API_CACHE_POLICIES.find(({ pattern }) =>
    pattern.test(cleanPath),
  );

  return policy ? { name: policy.name, ttlMs: policy.ttlMs } : undefined;
}

// Stable cache key = finalPath + sorted query params, excluding `token`.
// Values are serialized with URLSearchParams so `&`/`=` inside a value stay
// percent-encoded and cannot collide with a separate param pair.
export function buildApiCacheKey(
  finalPath: string,
  searchParams: URLSearchParams,
): string {
  const pairs: Array<[string, string]> = [];
  searchParams.forEach((value, key) => {
    if (key !== 'token') pairs.push([key, value]);
  });

  if (pairs.length === 0) return finalPath;

  pairs.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));

  const serialized = new URLSearchParams();
  pairs.forEach(([key, value]) => serialized.append(key, value));
  return `${finalPath}?${serialized.toString()}`;
}

export function getApiCache(key: string): ApiCacheEntry | undefined {
  const entry = apiCache.get(key);
  if (!entry) return undefined;

  if (Date.now() - entry.storedAt > entry.ttlMs) {
    apiCache.delete(key);
    return undefined;
  }

  // Refresh insertion order for simple LRU eviction.
  apiCache.delete(key);
  apiCache.set(key, entry);
  return entry;
}

export function setApiCache(
  key: string,
  body: unknown,
  status: number,
  ttlMs: number,
): void {
  // Never cache non-2xx responses.
  if (status < 200 || status >= 300) return;

  apiCache.set(key, { body, status, storedAt: Date.now(), ttlMs });

  // Evict oldest entries beyond the cap.
  while (apiCache.size > API_CACHE_MAX) {
    const oldest = apiCache.keys().next().value;
    if (oldest === undefined) break;
    apiCache.delete(oldest);
  }
}
