'use client';

const CLIENT_CACHE_VERSION = '2026-03-21.1';
const CLIENT_CACHE_VERSION_KEY = 'airqo:client-cache:version';

const SWR_CACHE_PREFIX = 'airqo:swr-cache:';
const QUERY_CACHE_PREFIX = 'airqo:react-query:';
const LEGACY_SWR_CACHE_PREFIX = 'airqo:swr-cache:v1:';
const LEGACY_QUERY_CACHE_PREFIX = 'airqo:react-query:v1:';
const PERSISTED_USER_STATE_KEY = 'persist:user';

const CACHE_VERSION_MISMATCH_LOG_KEY = 'airqo:cache-version-mismatch:last';

const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const safeRemove = (key: string) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore localStorage failures so cache maintenance never blocks app boot.
  }
};

const shouldDeleteCacheKey = (key: string): boolean => {
  return (
    key.startsWith(SWR_CACHE_PREFIX) ||
    key.startsWith(QUERY_CACHE_PREFIX) ||
    key.startsWith(LEGACY_SWR_CACHE_PREFIX) ||
    key.startsWith(LEGACY_QUERY_CACHE_PREFIX)
  );
};

export const shouldEnablePersistentClientCache = (): boolean => {
  return process.env.NEXT_PUBLIC_ENABLE_PERSISTED_CLIENT_CACHE === 'true';
};

export const runClientCacheMaintenance = (): void => {
  if (!isBrowser()) {
    return;
  }

  const currentVersion = window.localStorage.getItem(CLIENT_CACHE_VERSION_KEY);
  if (currentVersion === CLIENT_CACHE_VERSION) {
    return;
  }

  const keysToDelete: string[] = [];

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    if (shouldDeleteCacheKey(key) || key === PERSISTED_USER_STATE_KEY) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(safeRemove);

  try {
    window.localStorage.setItem(CLIENT_CACHE_VERSION_KEY, CLIENT_CACHE_VERSION);
    window.localStorage.setItem(
      CACHE_VERSION_MISMATCH_LOG_KEY,
      new Date().toISOString()
    );
  } catch {
    // Ignore localStorage failures.
  }
};
