'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/shared/services/analyticsService';
import { isAbortError } from '@/shared/lib/retryPolicy';
import type { AnalyticsReport } from '@/shared/types/api';

// Module-private: nothing outside this hook reads them, so exporting them only
// widens the module's API surface.
const ORGANIZATION_REPORT_STALE_TIME_MS = 5 * 60 * 1000;
const ORGANIZATION_REPORT_GC_TIME_MS = 30 * 60 * 1000;

interface UseOrganizationReportOptions {
  groupId: string;
  cohortId: string;
  startTime: string;
  endTime: string;
  enabled?: boolean;
}

export const useOrganizationReport = ({
  groupId,
  cohortId,
  startTime,
  endTime,
  enabled = true,
}: UseOrganizationReportOptions) => {
  const queryKey = useMemo(
    () =>
      ['organization-report', groupId, cohortId, startTime, endTime] as const,
    [groupId, cohortId, startTime, endTime]
  );
  const queryEnabled =
    enabled && !!groupId && !!cohortId && !!startTime && !!endTime;

  const query = useQuery<AnalyticsReport>({
    queryKey,
    queryFn: ({ signal }) =>
      analyticsService.getReport(
        { cohort_id: cohortId, start_time: startTime, end_time: endTime },
        signal
      ),
    enabled: queryEnabled,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: ORGANIZATION_REPORT_STALE_TIME_MS,
    gcTime: ORGANIZATION_REPORT_GC_TIME_MS,
  });

  const error = query.error
    ? isAbortError(query.error)
      ? null
      : query.error instanceof Error
        ? query.error.message
        : 'The organization report is temporarily unavailable.'
    : null;

  return {
    report: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error,
    refetch: query.refetch,
  };
};
