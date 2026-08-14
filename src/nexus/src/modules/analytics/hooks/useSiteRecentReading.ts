'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/shared/services/analyticsService';
import { boundedRetryPolicy } from '@/shared/lib/retryPolicy';
import type { RecentReading } from '@/shared/types/api';

const READING_STALE_TIME_MS = 1000 * 60 * 5;
const READING_GC_TIME_MS = 1000 * 60 * 60 * 12;

/**
 * The most recent reading for a single site (current AQI, pollutant values,
 * health tips and site details) — the data source for the location detail
 * page hero. Uses its own cache key (not the comparison-readings key, which
 * stores a batch array of a different shape).
 */
export const useSiteRecentReading = (siteId: string, enabled = true) => {
  const shouldFetch = enabled && !!siteId;

  return useQuery<RecentReading | null, Error>({
    queryKey: ['analytics', 'site-recent-reading', siteId],
    queryFn: async ({ signal }) => {
      const response = await analyticsService.getRecentReadings(
        { site_id: siteId },
        signal
      );
      return response?.measurements?.[0] ?? null;
    },
    enabled: shouldFetch,
    networkMode: 'online',
    staleTime: READING_STALE_TIME_MS,
    gcTime: READING_GC_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...boundedRetryPolicy,
  });
};
