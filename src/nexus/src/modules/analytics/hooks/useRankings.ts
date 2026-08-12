'use client';

import { useQuery } from '@tanstack/react-query';
import { rankingsService } from '@/shared/services/rankingsService';
import type {
  RankingsParams,
  RankingsResponse,
} from '@/shared/types/api';

/** Never retry aborts, network failures, or server errors (AGENTS.md retry policy) */
const RETRY_CONFIG = {
  retry: (failureCount: number, error: Error) => {
    if (
      error.name === 'CanceledError' ||
      error.name === 'AbortError' ||
      error.message === 'canceled' ||
      (error as { code?: string }).code === 'ERR_NETWORK'
    ) {
      return false;
    }
    const status =
      (error as { response?: { status?: number } }).response?.status ??
      (error as { status?: number }).status;
    if (typeof status === 'number' && status >= 500 && status < 600) {
      return false;
    }
    return failureCount < 1;
  },
  retryDelay: 1000,
} as const;

const RANKINGS_STALE_TIME_MS = 1000 * 60 * 5;
const RANKINGS_GC_TIME_MS = 1000 * 60 * 60 * 12;

/**
 * Fetches the current African AQI rankings leaderboard.
 *
 * The query key is derived from a stable serialization of the params object
 * so that re-renders never fire redundant requests.
 */
export function useRankings(
  params: RankingsParams = {},
  enabled = true
) {
  const queryKey = [
    'analytics',
    'rankings',
    params.level ?? 'country',
    params.sort ?? 'worst',
    params.limit ?? 20,
  ];

  const query = useQuery<RankingsResponse['data'], Error>({
    queryKey,
    queryFn: async ({ signal }) => {
      const response = await rankingsService.getRankings(params, signal);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to get rankings');
      }

      return response.data ?? [];
    },
    enabled,
    networkMode: 'online',
    staleTime: RANKINGS_STALE_TIME_MS,
    gcTime: RANKINGS_GC_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...RETRY_CONFIG,
  });

  return {
    rankings: query.data ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    error: query.error ? (query.error.message ?? null) : null,
    refetch: query.refetch,
  };
}
