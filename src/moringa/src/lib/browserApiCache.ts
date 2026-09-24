const MAP_API_CACHE_NAME = "airqo-map-api-cache-v1"
const LOCAL_STORAGE_PREFIX = "airqo:map-api-cache:"

const getCacheRequest = (key: string) => new Request(`https://airqo.local/cache/${encodeURIComponent(key)}`)

export interface BrowserApiCacheEntry<T> {
  cachedAt: string
  data: T
}

export const isBrowserApiCacheFresh = <T>(
  entry: BrowserApiCacheEntry<T> | null | undefined,
  maxAgeMs: number,
): entry is BrowserApiCacheEntry<T> => {
  if (!entry?.cachedAt) return false

  const cachedAtMs = new Date(entry.cachedAt).getTime()
  return Number.isFinite(cachedAtMs) && Date.now() - cachedAtMs <= maxAgeMs
}

export const readBrowserApiCache = async <T>(key: string): Promise<T | null> => {
  if (typeof window === "undefined") return null

  try {
    if ("caches" in window) {
      const cache = await caches.open(MAP_API_CACHE_NAME)
      const cached = await cache.match(getCacheRequest(key))
      if (cached) return (await cached.json()) as T
    }
  } catch (error) {
    console.warn(`Unable to read ${key} from Cache Storage:`, error)
  }

  try {
    const value = window.localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`)
    return value ? (JSON.parse(value) as T) : null
  } catch (error) {
    console.warn(`Unable to read ${key} from localStorage:`, error)
    return null
  }
}

export const writeBrowserApiCache = async <T>(key: string, data: T): Promise<void> => {
  if (typeof window === "undefined") return

  const body = JSON.stringify({
    cachedAt: new Date().toISOString(),
    data,
  })

  try {
    if ("caches" in window) {
      const cache = await caches.open(MAP_API_CACHE_NAME)
      await cache.put(
        getCacheRequest(key),
        new Response(body, {
          headers: {
            "Content-Type": "application/json",
          },
        }),
      )
      return
    }
  } catch (error) {
    console.warn(`Unable to write ${key} to Cache Storage:`, error)
  }

  try {
    window.localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, body)
  } catch (error) {
    console.warn(`Unable to write ${key} to localStorage:`, error)
  }
}
