'use client';

import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const QUERY_CACHE_KEY = 'airqo:react-query:v1';
const QUERY_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12 hours

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

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  const persister = useMemo(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    return createSyncStoragePersister({
      storage: window.localStorage,
      key: QUERY_CACHE_KEY,
      throttleTime: 1000,
      serialize: data => JSON.stringify(data),
      deserialize: value => JSON.parse(value),
    });
  }, []);

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
        buster: QUERY_CACHE_KEY,
      }}
      onSuccess={() => {
        queryClient.resumePausedMutations().catch(() => undefined);
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
