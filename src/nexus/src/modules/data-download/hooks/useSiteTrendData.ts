'use client';

import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  analyticsService,
  toDateString,
} from '@/shared/services/analyticsService';
import { boundedRetryPolicy } from '@/shared/lib/retryPolicy';
import { normalizeAirQualityData } from '@/shared/components/charts/utils';
import { normalizePollutant } from '@/modules/analytics/utils/chartConfig';
import type {
  FrequencyType,
  PollutantType,
  NormalizedChartData,
} from '@/shared/components/charts/types';
import type { ChartDataPoint } from '@/shared/types/api';

/** Time-range presets for the location trend chart (7D / 30D / 90D). */
export const TREND_PERIOD_PRESETS = [
  { value: '7D', label: '7D' },
  { value: '30D', label: '30D' },
  { value: '90D', label: '90D' },
] as const;

export type TrendPeriod = (typeof TREND_PERIOD_PRESETS)[number]['value'];

interface TrendPeriodConfig {
  frequency: FrequencyType;
  days: number;
}

/**
 * Daily averages for 7D/30D/90D — matches the D3 chart API's aggregation
 * ladder and keeps the y-axis honest at every preset.
 */
const PERIOD_CONFIG: Record<TrendPeriod, TrendPeriodConfig> = {
  '7D': { frequency: 'daily', days: 7 },
  '30D': { frequency: 'daily', days: 30 },
  '90D': { frequency: 'daily', days: 90 },
};

const TREND_STALE_TIME_MS = 1000 * 60 * 10;
const TREND_GC_TIME_MS = 1000 * 60 * 60 * 12;

interface UseSiteTrendDataOptions {
  siteId?: string;
  period?: TrendPeriod;
  pollutant?: PollutantType;
  enabled?: boolean;
}

/**
 * Trend (D3 chart) data for a single site at the given time-range preset.
 *
 * NOTE: the backend chart endpoint only accepts `line`/`bar` chart types
 * (verified live: `area` returns 400 "Invalid chart type"). The data is
 * requested as a line chart and rendered as an area chart client-side by the
 * shared DynamicChart, so the API constraint never leaks into the UI.
 */
export const useSiteTrendData = ({
  siteId,
  period = '7D',
  pollutant = 'pm2_5',
  enabled = true,
}: UseSiteTrendDataOptions = {}) => {
  const config = PERIOD_CONFIG[period];

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date(end.getTime() - config.days * 24 * 60 * 60 * 1000);
    return {
      startDate: toDateString(start.toISOString()),
      endDate: toDateString(end.toISOString()),
    };
  }, [config.days]);

  const shouldFetch = enabled && !!siteId;

  const query = useQuery<NormalizedChartData[], Error>({
    queryKey: [
      'analytics',
      'site-trend',
      siteId ?? 'none',
      period,
      dateRange.startDate,
      dateRange.endDate,
      pollutant,
    ],
    queryFn: async ({ signal }) => {
      if (!siteId) return [];
      const response = await analyticsService.getChartData(
        {
          sites: [siteId],
          startDateTime: dateRange.startDate,
          endDateTime: dateRange.endDate,
          chartType: 'line',
          frequency: config.frequency,
          pollutant: normalizePollutant(pollutant),
          organisation_name: '',
        },
        signal
      );
      if (!Array.isArray(response?.data) || response.data.length === 0) {
        return [];
      }
      return normalizeAirQualityData(response.data as ChartDataPoint[]);
    },
    enabled: shouldFetch,
    networkMode: 'online',
    staleTime: TREND_STALE_TIME_MS,
    gcTime: TREND_GC_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...boundedRetryPolicy,
  });

  const refresh = useCallback(async () => {
    if (!shouldFetch) return;
    await query.refetch();
  }, [query, shouldFetch]);

  return {
    chartData: shouldFetch ? (query.data ?? []) : [],
    isLoading: shouldFetch ? query.isLoading : false,
    isRefreshing: shouldFetch ? query.isFetching : false,
    error: shouldFetch ? (query.error?.message ?? null) : null,
    refresh,
    hasData: shouldFetch ? (query.data?.length ?? 0) > 0 : false,
    period,
    frequency: config.frequency,
    dateRange,
  };
};
