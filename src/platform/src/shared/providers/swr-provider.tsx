'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { SWRConfig, type SWRConfiguration, type Cache, type State } from 'swr';
import { shouldEnablePersistentClientCache } from '@/shared/lib/clientCache';

const SWR_CACHE_STORAGE_KEY_PREFIX = 'airqo:swr-cache:v2';
const SWR_CACHE_MAX_AGE_MS = 1000 * 60 * 30; // 30 minutes
const SWR_PERSIST_INTERVAL_MS = 1000 * 30; // 30 seconds
const SWR_MAX_PERSISTED_ENTRIES = 400;

type SerializedSWRCache = {
  timestamp: number;
  entries: Array<[string, unknown]>;
};

type SWRCacheState = State<unknown, unknown>;

type PersistedSWRState = {
  data: unknown;
  updatedAt: number;
};

interface SWRProviderProps {
  children: React.ReactNode;
  scopeKey?: string | null;
  enablePersistence?: boolean;
}

const buildStorageKey = (scopeKey?: string | null): string | null => {
  if (!scopeKey) return null;
  return `${SWR_CACHE_STORAGE_KEY_PREFIX}:${scopeKey}`;
};

const shouldRetryOnError = (): boolean => {
  return false;
};

const sanitizeStateForPersistence = (
  state: SWRCacheState
): PersistedSWRState | null => {
  if (!state || typeof state !== 'object') {
    return null;
  }

  if (typeof state.data === 'undefined') {
    return null;
  }

  return {
    data: state.data,
    updatedAt: Date.now(),
  };
};

const sanitizeLoadedState = (value: unknown): SWRCacheState | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as { data?: unknown; updatedAt?: unknown };
  const data = candidate.data;
  const updatedAt =
    typeof candidate.updatedAt === 'number' ? candidate.updatedAt : NaN;

  if (typeof data === 'undefined') {
    return null;
  }

  if (!Number.isFinite(updatedAt)) {
    return null;
  }

  if (Date.now() - updatedAt > SWR_CACHE_MAX_AGE_MS) {
    return null;
  }

  return {
    data,
    error: undefined,
    isLoading: false,
    isValidating: false,
  };
};

const loadPersistedCache = (
  storageKey: string | null
): Map<string, SWRCacheState> => {
  const cache = new Map<string, SWRCacheState>();

  if (typeof window === 'undefined' || !storageKey) {
    return cache;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return cache;

    const parsed = JSON.parse(raw) as SerializedSWRCache;
    if (
      !parsed ||
      typeof parsed.timestamp !== 'number' ||
      !Array.isArray(parsed.entries)
    ) {
      window.localStorage.removeItem(storageKey);
      return cache;
    }

    if (Date.now() - parsed.timestamp > SWR_CACHE_MAX_AGE_MS) {
      window.localStorage.removeItem(storageKey);
      return cache;
    }

    for (const [key, value] of parsed.entries) {
      if (typeof key !== 'string') {
        continue;
      }

      const sanitizedState = sanitizeLoadedState(value);
      if (!sanitizedState) continue;

      cache.set(key, sanitizedState);
    }
  } catch {
    window.localStorage.removeItem(storageKey);
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

    const persistableState = sanitizeStateForPersistence(value);
    if (!persistableState) {
      continue;
    }

    try {
      JSON.stringify(persistableState);
      entries.push([key, persistableState]);
    } catch {
      continue;
    }

    if (entries.length >= SWR_MAX_PERSISTED_ENTRIES) {
      break;
    }
  }

  return entries;
};

const persistCache = (
  cache: Map<string, SWRCacheState>,
  storageKey: string | null
) => {
  if (typeof window === 'undefined' || !storageKey) {
    return;
  }

  const entries = getSerializableEntries(cache);
  if (entries.length === 0) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  let candidateEntries = entries;
  while (candidateEntries.length > 0) {
    try {
      const payload: SerializedSWRCache = {
        timestamp: Date.now(),
        entries: candidateEntries,
      };
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
      return;
    } catch {
      candidateEntries = candidateEntries.slice(
        0,
        Math.floor(candidateEntries.length / 2)
      );
    }
  }
};

export function SWRProvider({
  children,
  scopeKey,
  enablePersistence = true,
}: SWRProviderProps) {
  const shouldPersist =
    enablePersistence && shouldEnablePersistentClientCache();
  const storageKey = useMemo(
    () => (shouldPersist ? buildStorageKey(scopeKey) : null),
    [scopeKey, shouldPersist]
  );
  const cache = useMemo(() => loadPersistedCache(storageKey), [storageKey]);

  const persistNow = useCallback(() => {
    persistCache(cache, storageKey);
  }, [cache, storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined' || !storageKey) return;

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
  }, [persistNow, storageKey]);

  const config = useMemo<SWRConfiguration>(
    () => ({
      provider: () => cache as Cache<SWRCacheState>,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: true,
      keepPreviousData: true,
      dedupingInterval: 1000 * 30,
      focusThrottleInterval: 1000 * 60,
      errorRetryCount: 0,
      errorRetryInterval: 2000,
      shouldRetryOnError,
      isPaused: () => typeof navigator !== 'undefined' && !navigator.onLine,
    }),
    [cache]
  );

  return <SWRConfig value={config}>{children}</SWRConfig>;
}
