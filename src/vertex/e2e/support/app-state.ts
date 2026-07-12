import type { Page } from "@playwright/test";

// Matches QUERY_CACHE_KEY_PREFIX in core/providers/query-provider.tsx.
const QUERY_CACHE_KEY_PREFIX = "airqo:vertex:react-query:v1";

/**
 * Clears the app's persisted React Query cache before every page load in this
 * page. The cache is persisted to localStorage and rides along inside the auth
 * storageState, so a hydrated page may serve cohorts/devices from cache and
 * never fire the network requests a spec waits for.
 */
export async function clearPersistedQueryCache(page: Page): Promise<void> {
  await page.addInitScript((prefix) => {
    try {
      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // Storage unavailable — nothing to clear.
    }
  }, QUERY_CACHE_KEY_PREFIX);
}
