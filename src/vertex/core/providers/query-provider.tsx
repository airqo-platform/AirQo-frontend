"use client";

import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { shouldEnablePersistentClientCache } from "@/core/utils/clientCache";
import { getQueryRetryDelay, shouldRetryQuery } from "@/core/utils/queryRecoveryPolicy";

const QUERY_CACHE_KEY_PREFIX = "airqo:vertex:react-query:v1";
const QUERY_CACHE_MAX_AGE_MS = 1000 * 60 * 30; // 30 minutes

interface QueryProviderProps {
  children: React.ReactNode;
  scopeKey?: string | null;
  enablePersistence?: boolean;
}

const buildStorageKey = (scopeKey?: string | null): string | null => {
  if (!scopeKey) return null;
  return `${QUERY_CACHE_KEY_PREFIX}:${scopeKey}`;
};

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: "online",
        staleTime: 1000 * 60,
        gcTime: QUERY_CACHE_MAX_AGE_MS,
        refetchOnWindowFocus: true,
        // Off so nothing refetches before the app is confirmed reachable: useConnectionRecovery
        // re-runs stale and failed queries after its ping. Paused requests still resume on their own.
        refetchOnReconnect: false,
        retry: shouldRetryQuery,
        retryDelay: getQueryRetryDelay,
      },
      mutations: {
        networkMode: "online",
        retry: 0,
      },
    },
  });

export function QueryProvider({
  children,
  scopeKey,
  enablePersistence = true,
}: QueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient());
  const shouldPersist =
    enablePersistence && shouldEnablePersistentClientCache();
  const storageKey = useMemo(
    () => (shouldPersist ? buildStorageKey(scopeKey) : null),
    [scopeKey, shouldPersist]
  );

  const persister = useMemo(() => {
    if (typeof window === "undefined" || !storageKey) {
      return undefined;
    }

    return createSyncStoragePersister({
      storage: window.localStorage,
      key: storageKey,
      throttleTime: 1000,
      serialize: (data) => JSON.stringify(data),
      deserialize: (value) => JSON.parse(value),
    });
  }, [storageKey]);

  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: QUERY_CACHE_MAX_AGE_MS,
        buster: storageKey ?? undefined,
      }}
      onSuccess={() => {
        queryClient.resumePausedMutations().catch(() => undefined);
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
