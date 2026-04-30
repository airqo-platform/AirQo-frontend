"use client";

const CLIENT_CACHE_VERSION = "2026-04-30.1";
const CLIENT_CACHE_VERSION_KEY = "airqo:vertex:client-cache:version";
const QUERY_CACHE_PREFIX = "airqo:vertex:react-query:";
const CACHE_VERSION_MISMATCH_LOG_KEY = "airqo:vertex:cache-version-mismatch:last";

const ENABLE_PERSISTED_CLIENT_CACHE = true;

const isBrowser = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const safeRemove = (key: string) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore localStorage failures so cache maintenance never blocks app boot.
  }
};

export const shouldEnablePersistentClientCache = (): boolean => {
  return ENABLE_PERSISTED_CLIENT_CACHE;
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

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    if (key.startsWith(QUERY_CACHE_PREFIX)) {
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
