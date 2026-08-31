'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/shared/services/analyticsService';
import type { RecentReading } from '@/shared/types/api';
import { mergeComparisonReadings } from '../utils/comparisonRows';
import { CHART_DATA_STALE_TIME_MS, ANALYTICS_QUERY_GC_TIME_MS } from './index';

/**
 * True when the new comparisons-readings endpoint is not implemented
 * server-side (404 Not Found, 405 Method Not Allowed, 501 Not Implemented).
 * In that case the caller falls back to the legacy /devices/readings/recent
 * endpoint. 5xx / network errors are NOT "unavailable" — per AGENTS.md those
 * must never be retried, they surface as real failures.
 */
export const isComparisonReadingsUnavailable = (error: unknown): boolean => {
  const axiosError = error as {
    response?: { status?: number };
    isAxiosError?: boolean;
  };
  const status = axiosError?.response?.status;
  return status === 404 || status === 405 || status === 501;
};

/**
 * The React Query key for a recent-readings request. Exported so tests and
 * consumers share one cache identity:
 *
 * - `userId` + `groupId` scope the entry per user AND per group — a request
 *   fired for group A can never resolve into group B's cache (AGENTS.md).
 * - Site ids are sorted so selection order is irrelevant to the cache.
 */
export const buildRecentReadingsKey = (
  userId: string | undefined,
  groupId: string | undefined,
  siteIds: string[]
): unknown[] => [
  'analytics',
  'recent-readings',
  userId ?? 'anonymous',
  groupId ?? 'no-active-group',
  [...siteIds].sort(),
];

export interface UseRecentReadingsOptions {
  userId?: string;
  groupId?: string;
  /** Live selection of site ids to fetch the latest reading for. */
  siteIds: string[];
  enabled?: boolean;
}

export interface UseRecentReadingsResult {
  readings: RecentReading[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Latest air-quality readings for a set of sites. Fires two requests in
 * parallel with a shared AbortSignal:
 *
 * 1. POST /devices/readings/comparisons — provides SITE METADATA ONLY
 *    (name, location_name, city, country, geo) and the has_reading flag.
 * 2. POST /devices/readings/recent — provides the actual MEASUREMENTS
 *    (aqi, pm2_5/pm10/no2, time, freshness).
 *
 * The results are merged per site_id so the comparison table displays both
 * the correct location_name and live measurements. Network hygiene per
 * AGENTS.md: AbortController-aware (React Query signal -> axios), no
 * retries of any kind, no window-focus or reconnect refetches, online-only,
 * group-scoped key, 5-minute stale window shared with chart data so repeat
 * views within 5 minutes hit the cache.
 */
export const useRecentReadings = ({
  userId,
  groupId,
  siteIds,
  enabled = true,
}: UseRecentReadingsOptions): UseRecentReadingsResult => {
  // Sorted copy keeps the key stable regardless of selection order.
  const queryKey = useMemo(
    () => buildRecentReadingsKey(userId, groupId, siteIds),
    [userId, groupId, siteIds]
  );

  const shouldFetch = enabled && siteIds.length > 0 && !!userId && !!groupId;

  const query = useQuery<RecentReading[], Error>({
    queryKey,
    queryFn: async ({ signal }) => {
      const [comparisonResult, recentResult] = await Promise.allSettled([
        analyticsService.getComparisonReadings(siteIds, signal),
        analyticsService.getRecentReadings(siteIds, signal),
      ]);

      // Measurements are essential: a real recent-endpoint failure (5xx,
      // network) surfaces as-is and is never retried (AGENTS.md).
      if (recentResult.status === 'rejected') {
        throw recentResult.reason;
      }
      const recentReadings = recentResult.value;

      // The comparisons endpoint may not be deployed yet (404/405/501) —
      // degrade to metadata-less recent readings, which the table already
      // renders. Any other failure surfaces as-is.
      if (comparisonResult.status === 'rejected') {
        if (isComparisonReadingsUnavailable(comparisonResult.reason)) {
          return recentReadings;
        }
        throw comparisonResult.reason;
      }

      return mergeComparisonReadings(comparisonResult.value, recentReadings);
    },
    enabled: shouldFetch,
    networkMode: 'online',
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: CHART_DATA_STALE_TIME_MS,
    gcTime: ANALYTICS_QUERY_GC_TIME_MS,
    placeholderData: previousData => previousData,
  });

  return {
    readings: shouldFetch ? (query.data ?? []) : [],
    isLoading: shouldFetch ? query.isLoading : false,
    isFetching: shouldFetch ? query.isFetching : false,
    error: shouldFetch ? query.error : null,
    refetch: () => {
      if (shouldFetch) void query.refetch();
    },
  };
};
