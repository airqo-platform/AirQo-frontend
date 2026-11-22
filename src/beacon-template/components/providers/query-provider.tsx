"use client"

import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  getConnectionState,
  onConnectionRestored,
  subscribe as subscribeToConnection,
} from '@/lib/network-status';
import { backoffDelay, getErrorStatus, isTransientError } from '@/lib/retry';

const MAX_RETRIES = 3;

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        networkMode: 'online',
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
        // Retry transient failures only; a 4xx will fail the same way again
        retry: (failureCount, error) => failureCount < MAX_RETRIES && isTransientError(error),
        retryDelay: (attempt) => backoffDelay(attempt),
      },
      mutations: {
        networkMode: 'online',
        retry: false,
      },
    },
  }));

  useEffect(() => {
    // React Query only watches the browser's online/offline events. Share Beacon's
    // monitor instead, which also confirms the server is reachable before resuming.
    onlineManager.setEventListener((setOnline) => {
      const sync = () => {
        const state = getConnectionState();
        setOnline(state === 'online' || state === 'restored');
      };
      sync();
      return subscribeToConnection(sync);
    });

    // Queries that errored during the outage but still hold data within staleTime
    // aren't refetched on reconnect by default, so refetch them explicitly.
    const unsubscribe = onConnectionRestored(() => {
      void queryClient.refetchQueries(
        {
          type: 'active',
          predicate: (query) => query.state.status === 'error' && getErrorStatus(query.state.error) === undefined,
        },
        { cancelRefetch: false },
      );
    });

    return unsubscribe;
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
