"use client";

import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { shouldEnablePersistentClientCache } from "@/core/utils/clientCache";
import type { AxiosError } from "axios";

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

const getErrorStatusCode = (error: unknown): number | null => {
  const axiosLike = error as AxiosError | undefined;
  if (typeof axiosLike?.response?.status === "number") {
    return axiosLike.response.status;
  }

  const generic = error as { status?: number } | undefined;
  if (typeof generic?.status === "number") {
    return generic.status;
  }

  return null;
};

const getErrorCode = (error: unknown): string | null => {
  const axiosLike = error as AxiosError | undefined;
  return typeof axiosLike?.code === "string" ? axiosLike.code : null;
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: "online",
        staleTime: 1000 * 60,
        gcTime: QUERY_CACHE_MAX_AGE_MS,
        refetchOnWindowFocus: true,
        refetchOnReconnect: false,
        retry: (failureCount, error) => {
          if (typeof navigator !== "undefined" && !navigator.onLine) {
            return false;
          }

          const status = getErrorStatusCode(error);
          if (status !== null && status >= 500) {
            return false;
          }

          if (getErrorCode(error) === "ERR_CANCELED") {
            return false;
          }

          if (status === 401 || status === 403 || status === 404 || status === 422) {
            return false;
          }

          return failureCount < 2;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
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
