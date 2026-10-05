// ---------------------------------------------------------------------------
// Bounded in-memory TTL cache for network-coverage GET responses.
// Module-level so it survives across requests in a single Node process.
// No Next.js imports here so the cache logic stays unit-testable.
// ---------------------------------------------------------------------------

export interface CoverageCacheEntry {
  body: unknown;
  status: number;
  storedAt: number;
}

export const COVERAGE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const COVERAGE_CACHE_MAX = 20;

const coverageCache = new Map<string, CoverageCacheEntry>();

// Stable cache key = finalPath + sorted query params, excluding `token`.
// Values are serialized with URLSearchParams so `&`/`=` inside a value stay
// percent-encoded and cannot collide with a separate param pair.
export function buildCoverageCacheKey(
  finalPath: string,
  searchParams: URLSearchParams,
): string {
  const pairs: Array<[string, string]> = [];
  searchParams.forEach((value, key) => {
    if (key !== 'token') pairs.push([key, value]);
  });

  if (pairs.length === 0) return finalPath;

  // Stable sort: duplicate keys keep their insertion order.
  pairs.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));

  const serialized = new URLSearchParams();
  pairs.forEach(([key, value]) => serialized.append(key, value));
  return `${finalPath}?${serialized.toString()}`;
}

export function getCoverageCache(key: string): CoverageCacheEntry | undefined {
  const entry = coverageCache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.storedAt > COVERAGE_CACHE_TTL_MS) {
    coverageCache.delete(key);
    return undefined;
  }
  // Refresh insertion order for simple LRU eviction.
  coverageCache.delete(key);
  coverageCache.set(key, entry);
  return entry;
}

export function setCoverageCache(
  key: string,
  body: unknown,
  status: number,
): void {
  // Never cache non-2xx responses.
  if (status < 200 || status >= 300) return;
  coverageCache.set(key, { body, status, storedAt: Date.now() });
  // Evict oldest entries beyond the cap.
  while (coverageCache.size > COVERAGE_CACHE_MAX) {
    const oldest = coverageCache.keys().next().value;
    if (oldest === undefined) break;
    coverageCache.delete(oldest);
  }
}
