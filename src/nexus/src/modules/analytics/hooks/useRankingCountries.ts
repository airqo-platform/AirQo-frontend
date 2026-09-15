'use client';

import { useQuery } from '@tanstack/react-query';
import { rankingsService } from '@/shared/services/rankingsService';
import { boundedRetryPolicy } from '@/shared/lib/retryPolicy';
import type { RankingCountry } from '@/shared/types/api';

const COUNTRIES_STALE_TIME_MS = 1000 * 60 * 10;
const COUNTRIES_GC_TIME_MS = 1000 * 60 * 60 * 12;

/**
 * Fetches the list of countries that have rankable locations (a reading in
 * the last 3 days). Backs the country filter dropdowns on both the live and
 * history rankings tabs.
 */
export function useRankingCountries(enabled = true) {
  const query = useQuery<RankingCountry[], Error>({
    queryKey: ['analytics', 'rankings', 'countries'],
    queryFn: async ({ signal }) => {
      const response = await rankingsService.getRankingCountries(signal);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to get ranking countries');
      }

      return response.data ?? [];
    },
    enabled,
    networkMode: 'online',
    staleTime: COUNTRIES_STALE_TIME_MS,
    gcTime: COUNTRIES_GC_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...boundedRetryPolicy,
  });

  return {
    countries: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? (query.error.message ?? null) : null,
    refetch: query.refetch,
  };
}
