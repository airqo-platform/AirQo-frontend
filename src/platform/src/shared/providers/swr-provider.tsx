'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { SWRConfig, type SWRConfiguration, type Cache, type State } from 'swr';

const SWR_CACHE_STORAGE_KEY = 'airqo:swr-cache:v1';
const SWR_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12 hours
const SWR_PERSIST_INTERVAL_MS = 1000 * 30; // 30 seconds
const SWR_MAX_PERSISTED_ENTRIES = 400;

type SerializedSWRCache = {
  timestamp: number;
  entries: Array<[string, unknown]>;
};

type SWRCacheState = State<unknown, unknown>;

const getErrorStatusCode = (error: unknown): number | null => {
  if (!error || typeof error !== 'object') return null;

  const axiosLike = error as {
    status?: number;
    response?: { status?: number };
  };

  if (typeof axiosLike.response?.status === 'number') {
    return axiosLike.response.status;
  }

  if (typeof axiosLike.status === 'number') {
    return axiosLike.status;
  }

  return null;
};

const shouldRetryOnError = (error: unknown): boolean => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  const status = getErrorStatusCode(error);
  if (!status) return true;

  if (status === 401 || status === 403 || status === 404) {
    return false;
  }

  return true;
};

const loadPersistedCache = (): Map<string, SWRCacheState> => {
  const cache = new Map<string, SWRCacheState>();

  if (typeof window === 'undefined') {
    return cache;
  }

  try {
    const raw = window.localStorage.getItem(SWR_CACHE_STORAGE_KEY);
    if (!raw) return cache;

    const parsed = JSON.parse(raw) as SerializedSWRCache;
    if (
      !parsed ||
      typeof parsed.timestamp !== 'number' ||
      !Array.isArray(parsed.entries)
    ) {
      window.localStorage.removeItem(SWR_CACHE_STORAGE_KEY);
      return cache;
    }

    if (Date.now() - parsed.timestamp > SWR_CACHE_MAX_AGE_MS) {
      window.localStorage.removeItem(SWR_CACHE_STORAGE_KEY);
      return cache;
    }

    for (const [key, value] of parsed.entries) {
      if (typeof key === 'string') {
        cache.set(key, value as SWRCacheState);
      }
    }
  } catch {
    window.localStorage.removeItem(SWR_CACHE_STORAGE_KEY);
  }

  return cache;
};

const getSerializableEntries = (
  cache: Map<string, SWRCacheState>
): Array<[string, unknown]> => {
  const entries: Array<[string, unknown]> = [];

  for (const [key, value] of Array.from(cache.entries())) {
    if (typeof key !== 'string') continue;
    if (typeof value === 'undefined') continue;

    try {
      JSON.stringify(value);
      entries.push([key, value]);
    } catch {
      continue;
    }

    if (entries.length >= SWR_MAX_PERSISTED_ENTRIES) {
      break;
    }
  }

  return entries;
};

const persistCache = (cache: Map<string, SWRCacheState>) => {
  if (typeof window === 'undefined') {
    return;
  }

  const entries = getSerializableEntries(cache);
  if (entries.length === 0) {
    window.localStorage.removeItem(SWR_CACHE_STORAGE_KEY);
    return;
  }

  let candidateEntries = entries;
  while (candidateEntries.length > 0) {
    try {
      const payload: SerializedSWRCache = {
        timestamp: Date.now(),
        entries: candidateEntries,
      };
      window.localStorage.setItem(SWR_CACHE_STORAGE_KEY, JSON.stringify(payload));
      return;
    } catch {
      candidateEntries = candidateEntries.slice(
        0,
        Math.floor(candidateEntries.length / 2)
      );
    }
  }
};

export function SWRProvider({ children }: { children: React.ReactNode }) {
  const cache = useMemo(() => loadPersistedCache(), []);

  const persistNow = useCallback(() => {
    persistCache(cache);
  }, [cache]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const intervalId = window.setInterval(persistNow, SWR_PERSIST_INTERVAL_MS);
    const handleBeforeUnload = () => persistNow();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        persistNow();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [persistNow]);

  const config = useMemo<SWRConfiguration>(
    () => ({
      provider: () => cache as Cache<SWRCacheState>,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
      keepPreviousData: true,
      dedupingInterval: 1000 * 15,
      focusThrottleInterval: 1000 * 60,
      errorRetryCount: 2,
      errorRetryInterval: 2000,
      shouldRetryOnError,
      isPaused: () => typeof navigator !== 'undefined' && !navigator.onLine,
    }),
    [cache]
  );

  return <SWRConfig value={config}>{children}</SWRConfig>;
}
