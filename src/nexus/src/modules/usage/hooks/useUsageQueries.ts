'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { usageService } from '@/shared/services';
import { boundedRetryPolicy } from '@/shared/lib/retryPolicy';
import type {
  UsageBreakdownParams,
  UsageBreakdownResponse,
  UsageCalendarParams,
  UsageCalendarResponse,
  UsageCsvExportResult,
  UsageExportCsvParams,
  UsageOverviewParams,
  UsageOverviewResponse,
  UsagePagesParams,
  UsagePagesResponse,
  UsageRetentionParams,
  UsageRetentionResponse,
  UsageRhythmParams,
  UsageRhythmResponse,
  UsageSummaryParams,
  UsageSummaryResponse,
  UsageTimelineParams,
  UsageTimelineResponse,
  UsageUsersParams,
  UsageUsersResponse,
} from '@/shared/types/usage';

/**
 * Stale time for usage-stats React Query caches. 5 min — repeat views within
 * that window hit the cache (mirrors the analytics chart-data stale window).
 */
export const USAGE_QUERY_STALE_TIME_MS = 1000 * 60 * 5;

/** Builds a scope-aware React Query key for a usage read. */
const buildKey = (name: string, ...rest: unknown[]): unknown[] => [
  'usage',
  name,
  ...rest,
];

/**
 * Shared React Query defaults for every usage read: bounded retry, no
 * refetch on window focus/reconnect, the 5-min stale window, and previous
 * data as placeholder so filter changes never flash empty content. Each
 * hook still passes its own `queryKey`, `enabled` guard, and `queryFn`
 * explicitly — only the boilerplate lives here.
 */
const usageQueryDefaults = {
  networkMode: 'online',
  ...boundedRetryPolicy,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  staleTime: USAGE_QUERY_STALE_TIME_MS,
  placeholderData: <T>(previousData: T): T => previousData,
} as const;

/**
 * Maps a usage query onto the stable result shape every usage hook returns:
 * `data` normalised to `null` plus loading/fetching/error/refetch passthrough.
 */
const mapUsageQueryResult = <TData>(query: UseQueryResult<TData, Error>) => ({
  data: query.data ?? null,
  isLoading: query.isLoading,
  isFetching: query.isFetching,
  error: query.error,
  refetch: query.refetch,
});

/**
 * Shared read-query wrapper. Endpoint hooks below only describe their key and
 * service call; retry, cancellation, stale-data, and result-shape behaviour
 * stays in one place.
 *
 * `scopeOwner` identifies the identity scope a key belongs to (the user id for
 * per-user reads). Previous data is reused as placeholder only while that scope
 * is unchanged, so switching profiles never paints one user's numbers under
 * another's name while their request is still in flight. Omit it for
 * platform-wide reads, which have no per-user identity.
 */
const useUsageQuery = <TData>(
  queryKey: unknown[],
  queryFn: (signal: AbortSignal) => Promise<TData>,
  enabled = true,
  scopeOwner?: string
) => {
  const query = useQuery<TData, Error>({
    queryKey,
    queryFn: ({ signal }) => queryFn(signal),
    enabled,
    ...usageQueryDefaults,
    ...(scopeOwner !== undefined
      ? {
          placeholderData: <T>(previousData: T, previousQuery?: unknown) => {
            const previousOwner = (
              previousQuery as { queryKey?: readonly unknown[] } | undefined
            )?.queryKey?.[2];
            return (
              previousOwner === scopeOwner ? previousData : undefined
            ) as T;
          },
        }
      : {}),
  });

  return mapUsageQueryResult(query);
};

const useUserUsageQuery = <TData, TParams>(
  resource: string,
  userId: string | undefined,
  params: TParams,
  queryFn: (
    userId: string,
    params: TParams,
    signal: AbortSignal
  ) => Promise<TData>
) =>
  useUsageQuery(
    buildKey(resource, userId ?? 'anonymous', params),
    signal => {
      if (!userId) {
        throw new Error(`userId is required for usage ${resource}`);
      }
      return queryFn(userId, params, signal);
    },
    !!userId,
    userId
  );

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

export const useUsageCalendar = (
  userId: string | undefined,
  params: UsageCalendarParams = {}
) =>
  useUserUsageQuery<UsageCalendarResponse, UsageCalendarParams>(
    'calendar',
    userId,
    params,
    usageService.getCalendar.bind(usageService)
  );

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export const useUsageSummary = (
  userId: string | undefined,
  params: UsageSummaryParams = {}
) =>
  useUserUsageQuery<UsageSummaryResponse, UsageSummaryParams>(
    'summary',
    userId,
    params,
    usageService.getSummary.bind(usageService)
  );

// ---------------------------------------------------------------------------
// Breakdown
// ---------------------------------------------------------------------------

export const useUsageBreakdown = (
  userId: string | undefined,
  params: UsageBreakdownParams = {}
) =>
  useUserUsageQuery<UsageBreakdownResponse, UsageBreakdownParams>(
    'breakdown',
    userId,
    params,
    usageService.getBreakdown.bind(usageService)
  );

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export const useUsageTimeline = (
  userId: string | undefined,
  date: string | undefined,
  tz?: string
) => {
  const params: UsageTimelineParams = useMemo(
    () => ({ date: date ?? '', tz }),
    [date, tz]
  );

  return useUsageQuery(
    buildKey('timeline', userId ?? 'anonymous', params),
    signal => {
      if (!userId || !params.date) {
        throw new Error('userId and date are required for usage timeline');
      }
      return usageService.getTimeline(userId, params, signal);
    },
    !!userId && !!date,
    userId
  ) as ReturnType<typeof useUsageQuery<UsageTimelineResponse>>;
};

// ---------------------------------------------------------------------------
// Rhythm
// ---------------------------------------------------------------------------

export const useUsageRhythm = (
  userId: string | undefined,
  params: UsageRhythmParams = {}
) =>
  useUserUsageQuery<UsageRhythmResponse, UsageRhythmParams>(
    'rhythm',
    userId,
    params,
    usageService.getRhythm.bind(usageService)
  );

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export const useUsageOverview = (params: UsageOverviewParams = {}) => {
  return useUsageQuery(buildKey('overview', params), signal =>
    usageService.getOverview(params, signal)
  ) as ReturnType<typeof useUsageQuery<UsageOverviewResponse>>;
};

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export const useUsagePages = (params: UsagePagesParams = {}) => {
  return useUsageQuery(buildKey('pages', params), signal =>
    usageService.getPages(params, signal)
  ) as ReturnType<typeof useUsageQuery<UsagePagesResponse>>;
};

// ---------------------------------------------------------------------------
// Users table
// ---------------------------------------------------------------------------

export const useUsageUsers = (params: UsageUsersParams = {}) => {
  return useUsageQuery(buildKey('users', params), signal =>
    usageService.getUsers(params, signal)
  ) as ReturnType<typeof useUsageQuery<UsageUsersResponse>>;
};

// ---------------------------------------------------------------------------
// Retention
// ---------------------------------------------------------------------------

export const useUsageRetention = (params: UsageRetentionParams = {}) => {
  return useUsageQuery(buildKey('retention', params), signal =>
    usageService.getRetention(params, signal)
  ) as ReturnType<typeof useUsageQuery<UsageRetentionResponse>>;
};

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

const triggerBlobDownload = (result: UsageCsvExportResult): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const url = URL.createObjectURL(result.blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = result.filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Defer revocation to avoid Safari timing issues where the download
  // hasn't started yet when the blob URL is revoked synchronously.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

/**
 * CSV export helper. Returns a `exportUsers` callback plus loading/error
 * state. The actual download is triggered client-side from the returned blob.
 * Accepts an optional `AbortSignal` so callers can cancel in-flight requests.
 */
export const useUsageExportUsersCsv = () => {
  const [state, setState] = useState<{
    isExporting: boolean;
    error: Error | null;
  }>({ isExporting: false, error: null });

  const exportUsers = useCallback(
    async (params: UsageExportCsvParams = {}, signal?: AbortSignal) => {
      setState({ isExporting: true, error: null });

      try {
        const result = await usageService.exportUsersCsv(params, signal);
        triggerBlobDownload(result);
        setState({ isExporting: false, error: null });
        return { success: true as const, filename: result.filename };
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('CSV export failed');
        setState({ isExporting: false, error });
        throw error;
      }
    },
    []
  );

  return { exportUsers, ...state };
};
