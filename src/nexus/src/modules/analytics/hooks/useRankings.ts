'use client';

import { useQuery } from '@tanstack/react-query';
import { rankingsService } from '@/shared/services/rankingsService';
import { boundedRetryPolicy } from '@/shared/lib/retryPolicy';
import { sortRankingEntries } from '../utils/rankings';
import type {
  RankingEntry,
  RankingsMeta,
  RankingsParams,
} from '@/shared/types/api';

const RANKINGS_STALE_TIME_MS = 1000 * 60 * 5;
const RANKINGS_GC_TIME_MS = 1000 * 60 * 60 * 12;

interface RankingsQueryResult {
  entries: RankingEntry[];
  meta: RankingsMeta | null;
}

/**
 * Fetches the current African AQI rankings leaderboard.
 *
 * The query key is derived from a stable serialization of the params object
 * so that re-renders never fire redundant requests. The country code is part
 * of the key so switching countries can never serve another country's cached
 * rows.
 */
export function useRankings(params: RankingsParams = {}, enabled = true) {
  const queryKey = [
    'analytics',
    'rankings',
    params.level ?? 'country',
    params.sort ?? 'worst',
    params.limit ?? 20,
    params.country ?? 'all',
  ];

  const query = useQuery<RankingsQueryResult, Error>({
    queryKey,
    queryFn: async ({ signal }) => {
      const response = await rankingsService.getRankings(params, signal);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to get rankings');
      }

      return {
        entries: response.data ?? [],
        meta: response.data ? (response.meta ?? null) : null,
      };
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
    rankings: sortRankingEntries(
      query.data?.entries ?? [],
      params.sort ?? 'worst'
    ),
    rankingsMeta: query.data?.meta ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    error: query.error ? (query.error.message ?? null) : null,
    refetch: query.refetch,
  };
}
