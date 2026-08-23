'use client';

import { useQuery } from '@tanstack/react-query';
import { rankingsService } from '@/shared/services/rankingsService';
import { boundedRetryPolicy } from '@/shared/lib/retryPolicy';
import { sortRankingEntries } from '../utils/rankings';
import type {
  RankingsParams,
  RankingsResponse,
} from '@/shared/types/api';

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
    ...boundedRetryPolicy,
  });

  return {
    rankings: sortRankingEntries(query.data ?? [], params.sort ?? 'worst'),
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    error: query.error ? (query.error.message ?? null) : null,
    refetch: query.refetch,
  };
}
