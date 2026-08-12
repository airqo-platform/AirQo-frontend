'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/shared/services/analyticsService';
import type { RecentReading } from '@/shared/types/api';

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

const READINGS_STALE_TIME_MS = 1000 * 60 * 5;

/**
 * Latest readings for a set of sites, shared between the comparison table
 * and the page-level name hydration (one cached request, two consumers).
 */
export const useComparisonReadings = (
  siteIds: string[],
  enabled = true
) => {
  const shouldFetch = enabled && siteIds.length > 0;

  return useQuery<RecentReading[], Error>({
    queryKey: [
      'analytics',
      'comparison-readings',
      [...siteIds].sort().join(','),
    ],
    queryFn: async ({ signal }) => {
      const response = await analyticsService.getRecentReadings(
        { site_id: siteIds.join(',') },
        signal
      );
      return response?.measurements ?? [];
    },
    enabled: shouldFetch,
    networkMode: 'online',
    staleTime: READINGS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...RETRY_CONFIG,
  });
};

/**
 * Resolves a display name from site details using the standard fallback
 * chain: search_name → name → location_name → formatted_name.
 * Returns undefined when no non-empty field exists.
 */
export const resolveSiteName = (
  siteDetails: RecentReading['siteDetails'] | undefined
): string | undefined => {
  return (
    siteDetails?.search_name?.trim() ||
    siteDetails?.name?.trim() ||
    siteDetails?.location_name?.trim() ||
    siteDetails?.formatted_name?.trim() ||
    undefined
  );
};

/**
 * Builds a siteId → display-name map from the readings (each reading carries
 * its site details), skipping sites with no name.
 */
export const extractReadingNames = (
  readings: RecentReading[] | undefined
): Map<string, string> => {
  const names = new Map<string, string>();
  (readings ?? []).forEach(reading => {
    const name = resolveSiteName(reading.siteDetails);
    if (name) names.set(reading.site_id, name);
  });
  return names;
};
