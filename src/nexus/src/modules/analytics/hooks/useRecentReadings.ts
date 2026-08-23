'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/shared/services/analyticsService';
import type { RecentReading } from '@/shared/types/api';
import { CHART_DATA_STALE_TIME_MS, ANALYTICS_QUERY_GC_TIME_MS } from './index';

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
 * Latest air-quality readings for a set of sites (POST /devices/readings/recent
 * via the BFF). Network hygiene per AGENTS.md: AbortController-aware (React
 * Query signal → axios), no retries of any kind, no window-focus or reconnect
 * refetches, online-only, group-scoped key, 5-minute stale window shared with
 * chart data so repeat views within 5 minutes hit the cache.
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
    queryFn: async ({ signal }) =>
      analyticsService.getRecentReadings(siteIds, signal),
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
