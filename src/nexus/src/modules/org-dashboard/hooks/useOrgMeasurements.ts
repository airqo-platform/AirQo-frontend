'use client';

import { useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { deviceService } from '@/shared/services/deviceService';
import { useUser } from '@/shared/hooks/useUser';
import { boundedRetryPolicy, isAbortError } from '@/shared/lib/retryPolicy';
import type {
  Measurement,
  MeasurementsQueryParams,
  SiteAverages,
} from '@/shared/types/api';

const RECENT_STALE_TIME_MS = 1000 * 60 * 2;
const HISTORICAL_STALE_TIME_MS = 1000 * 60 * 10;
const HISTORICAL_GC_TIME_MS = 1000 * 60 * 60 * 12;

export interface DateRange {
  startTime: string;
  endTime: string;
}

export const buildDateRange = (days: number): DateRange => {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  };
};

export interface UseCohortRecentMeasurementsOptions {
  /** Single cohort id resolved from the organization group. */
  cohortId?: string | null;
  enabled?: boolean;
}

export interface UseMeasurementsResult {
  measurements: Measurement[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Live fleet snapshot — GET /devices/measurements/cohorts/{id}/recent.
 *
 * Query key is group-scoped (active group id + cohort id) so a fast group
 * switch can never resolve a request fired for group A into group B's cache.
 * Bounded retry policy: never retry aborts / ERR_NETWORK / 5xx; at most one
 * retry on 429. Abort errors never surface as user-facing failures.
 */
export function useCohortRecentMeasurements({
  cohortId,
  enabled = true,
}: UseCohortRecentMeasurementsOptions): UseMeasurementsResult {
  const { activeGroup } = useUser();

  const normalizedCohortId = cohortId?.trim() || null;
  const shouldFetch = enabled && !!normalizedCohortId;

  const query = useQuery({
    queryKey: [
      'org-dashboard',
      'cohort-recent',
      activeGroup?.id ?? 'no-active-group',
      normalizedCohortId ?? 'none',
    ],
    queryFn: async ({ signal }) => {
      const response = await deviceService.getRecentCohortMeasurements(
        normalizedCohortId as string,
        { metadata: 'site_id', limit: 200 },
        signal
      );
      return response.measurements ?? [];
    },
    enabled: shouldFetch,
    networkMode: 'online',
    ...boundedRetryPolicy,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: RECENT_STALE_TIME_MS,
    gcTime: HISTORICAL_GC_TIME_MS,
  });

  const refetch = async () => {
    if (!shouldFetch) return;
    await query.refetch();
  };

  return {
    measurements: shouldFetch ? (query.data ?? []) : [],
    isLoading: shouldFetch ? query.isLoading : false,
    isRefreshing: shouldFetch ? query.isFetching : false,
    error:
      shouldFetch && !isAbortError(query.error) && query.error
        ? (query.error as Error).message
        : null,
    refetch,
  };
}

export interface UseCohortHistoricalMeasurementsOptions {
  cohortId?: string | null;
  /** Rolling window in days (7 / 30 / 90). */
  days?: number;
  frequency?: MeasurementsQueryParams['frequency'];
  pollutant?: string;
  enabled?: boolean;
}

export interface UseCohortHistoricalResult extends UseMeasurementsResult {
  meta: {
    startTime: string;
    endTime: string;
  };
}

/**
 * Historical fleet measurements — GET /devices/measurements/cohorts/{id}/historical.
 * The date range is computed from the rolling window so the query key stays
 * stable across renders (no per-render timestamps).
 */
export function useCohortHistoricalMeasurements({
  cohortId,
  days = 7,
  frequency = 'daily',
  pollutant = 'pm2_5',
  enabled = true,
}: UseCohortHistoricalMeasurementsOptions): UseCohortHistoricalResult {
  const { activeGroup } = useUser();

  const dateRange = useMemo(() => buildDateRange(days), [days]);

  const normalizedCohortId = cohortId?.trim() || null;
  const shouldFetch = enabled && !!normalizedCohortId;

  const query = useQuery({
    queryKey: [
      'org-dashboard',
      'cohort-historical',
      activeGroup?.id ?? 'no-active-group',
      normalizedCohortId ?? 'none',
      days,
      dateRange.startTime,
      dateRange.endTime,
      frequency,
      pollutant,
    ],
    queryFn: async ({ signal }) => {
      const response = await deviceService.getHistoricalCohortMeasurements(
        normalizedCohortId as string,
        {
          startTime: dateRange.startTime,
          endTime: dateRange.endTime,
          frequency,
          limit: 500,
        },
        signal
      );
      return response.measurements ?? [];
    },
    enabled: shouldFetch,
    networkMode: 'online',
    ...boundedRetryPolicy,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: HISTORICAL_STALE_TIME_MS,
    gcTime: HISTORICAL_GC_TIME_MS,
  });

  const refetch = async () => {
    if (!shouldFetch) return;
    await query.refetch();
  };

  return {
    measurements: shouldFetch ? (query.data ?? []) : [],
    meta: dateRange,
    isLoading: shouldFetch ? query.isLoading : false,
    isRefreshing: shouldFetch ? query.isFetching : false,
    error:
      shouldFetch && !isAbortError(query.error) && query.error
        ? (query.error as Error).message
        : null,
    refetch,
  };
}

export interface UseSiteAveragesOptions {
  siteId?: string | null;
  days?: number;
  enabled?: boolean;
}

export interface UseSiteAveragesResult {
  averages: SiteAverages | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Site air-quality averages — GET /devices/measurements/sites/{id}/averages.
 * Exposes the week-over-week percentage difference used for location-card
 * trend badges.
 */
export function useSiteAverages({
  siteId,
  days = 14,
  enabled = true,
}: UseSiteAveragesOptions): UseSiteAveragesResult {
  const { activeGroup } = useUser();

  const dateRange = useMemo(() => buildDateRange(days), [days]);

  const normalizedSiteId = siteId?.trim() || null;
  const shouldFetch = enabled && !!normalizedSiteId;

  const query = useQuery({
    queryKey: [
      'org-dashboard',
      'site-averages',
      activeGroup?.id ?? 'no-active-group',
      normalizedSiteId ?? 'none',
      dateRange.startTime,
      dateRange.endTime,
    ],
    queryFn: async ({ signal }) => {
      const response = await deviceService.getSiteAverages(
        normalizedSiteId as string,
        {
          startTime: dateRange.startTime,
          endTime: dateRange.endTime,
          frequency: 'daily',
        },
        signal
      );
      const payload = response.measurements;
      if (Array.isArray(payload)) {
        return payload[0] ?? null;
      }
      return payload ?? null;
    },
    enabled: shouldFetch,
    networkMode: 'online',
    ...boundedRetryPolicy,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: HISTORICAL_STALE_TIME_MS,
    gcTime: HISTORICAL_GC_TIME_MS,
  });

  const refetch = async () => {
    if (!shouldFetch) return;
    await query.refetch();
  };

  return {
    averages: shouldFetch ? (query.data ?? null) : null,
    isLoading: shouldFetch ? query.isLoading : false,
    error:
      shouldFetch && !isAbortError(query.error) && query.error
        ? (query.error as Error).message
        : null,
    refetch,
  };
}

export interface UseSitesAveragesOptions {
  siteIds?: string[];
  enabled?: boolean;
}

export interface UseSitesAveragesResult {
  averagesBySite: Map<string, SiteAverages | null>;
  isLoading: boolean;
  errorBySite: Map<string, string>;
}

/**
 * Batch wrapper over `useSiteAverages` for the saved-location cards.
 * Partial failure is tolerated: a site whose averages request fails simply
 * renders without a trend badge.
 */
export function useSitesAverages({
  siteIds = [],
  enabled = true,
}: UseSitesAveragesOptions): UseSitesAveragesResult {
  const { activeGroup } = useUser();

  const dateRange = useMemo(() => buildDateRange(14), []);

  const queries = useQueries({
    queries: siteIds.map(siteId => {
      const shouldFetch = enabled && !!siteId;
      return {
        queryKey: [
          'org-dashboard',
          'site-averages',
          activeGroup?.id ?? 'no-active-group',
          siteId,
          dateRange.startTime,
          dateRange.endTime,
        ],
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
          const response = await deviceService.getSiteAverages(
            siteId,
            {
              startTime: dateRange.startTime,
              endTime: dateRange.endTime,
              frequency: 'daily',
            },
            signal
          );
          const payload = response.measurements;
          if (Array.isArray(payload)) {
            return payload[0] ?? null;
          }
          return payload ?? null;
        },
        enabled: shouldFetch,
        networkMode: 'online' as const,
        ...boundedRetryPolicy,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: HISTORICAL_STALE_TIME_MS,
        gcTime: HISTORICAL_GC_TIME_MS,
      };
    }),
  });

  return useMemo(() => {
    const averagesBySite = new Map<string, SiteAverages | null>();
    const errorBySite = new Map<string, string>();
    queries.forEach((query, index) => {
      const siteId = siteIds[index];
      if (!siteId) return;
      averagesBySite.set(
        siteId,
        !isAbortError(query.error) && query.data ? query.data : null
      );
      if (query.error && !isAbortError(query.error)) {
        errorBySite.set(siteId, query.error.message);
      }
    });
    return {
      averagesBySite,
      isLoading: queries.some(query => query.isLoading),
      errorBySite,
    };
  }, [queries, siteIds]);
}
