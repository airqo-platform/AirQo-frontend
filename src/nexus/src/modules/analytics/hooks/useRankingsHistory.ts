'use client';

import { useQuery } from '@tanstack/react-query';
import { rankingsService } from '@/shared/services/rankingsService';
import { boundedRetryPolicy } from '@/shared/lib/retryPolicy';
import type {
  RankingsHistoryParams,
  RankingsHistoryResponse,
} from '@/shared/types/api';

const HISTORY_STALE_TIME_MS = 1000 * 60 * 10;
const HISTORY_GC_TIME_MS = 1000 * 60 * 60 * 12;

/**
 * Fetches the multi-year historical AQI comparison for African
 * countries/cities. Years with no usable data come back as `null` from the
 * API — never `0` — and are surfaced as such for "no data" rendering.
 */
export function useRankingsHistory(
  params: RankingsHistoryParams,
  enabled = true
) {
  const queryKey = [
    'analytics',
    'rankings-history',
    params.level ?? 'country',
    params.start_year,
    params.end_year,
  ];

  const query = useQuery<RankingsHistoryResponse['data'], Error>({
    queryKey,
    queryFn: async ({ signal }) => {
      const response = await rankingsService.getRankingsHistory(
        params,
        signal
      );

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to get rankings history');
      }

      return response.data ?? [];
    },
    enabled,
    networkMode: 'online',
    staleTime: HISTORY_STALE_TIME_MS,
    gcTime: HISTORY_GC_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...boundedRetryPolicy,
  });

  return {
    history: query.data ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    error: query.error ? (query.error.message ?? null) : null,
    refetch: query.refetch,
  };
}
