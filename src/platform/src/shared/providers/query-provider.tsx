'use client';

import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const QUERY_CACHE_KEY_PREFIX = 'airqo:react-query:v1';
const QUERY_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12 hours

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

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: 'offlineFirst',
        staleTime: 1000 * 60 * 5,
        gcTime: QUERY_CACHE_MAX_AGE_MS,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return false;
          }

          const status = getErrorStatusCode(error);
          if (
            status === 401 ||
            status === 403 ||
            status === 404 ||
            status === 422
          ) {
            return false;
          }

          return failureCount < 2;
        },
        retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10000),
      },
      mutations: {
        networkMode: 'offlineFirst',
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
  const storageKey = useMemo(
    () => (enablePersistence ? buildStorageKey(scopeKey) : null),
    [enablePersistence, scopeKey]
  );

  const persister = useMemo(() => {
    if (typeof window === 'undefined' || !storageKey) {
      return undefined;
    }

    return createSyncStoragePersister({
      storage: window.localStorage,
      key: storageKey,
      throttleTime: 1000,
      serialize: data => JSON.stringify(data),
      deserialize: value => JSON.parse(value),
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
