'use client';

import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/shared/services/analyticsService';
import { boundedRetryPolicy } from '@/shared/lib/retryPolicy';
import { normalizeAirQualityData } from '@/shared/components/charts/utils';
import type {
  FrequencyType,
  PollutantType,
  NormalizedChartData,
} from '@/shared/components/charts/types';
import type { ChartDataPoint } from '@/shared/types/api';

/** Time-range presets for the location trend chart (24H / 7D / 30D). */
export const TREND_PERIOD_PRESETS = [
  { value: '24H', label: '24H' },
  { value: '7D', label: '7D' },
  { value: '30D', label: '30D' },
] as const;

export type TrendPeriod = (typeof TREND_PERIOD_PRESETS)[number]['value'];

interface TrendPeriodConfig {
  frequency: FrequencyType;
  days: number;
}

/**
 * Hourly buckets for 24H, daily averages for 7D/30D — matches the D3 chart
 * API's aggregation ladder and keeps the y-axis honest at every preset.
 */
const PERIOD_CONFIG: Record<TrendPeriod, TrendPeriodConfig> = {
  '24H': { frequency: 'hourly', days: 1 },
  '7D': { frequency: 'daily', days: 7 },
  '30D': { frequency: 'daily', days: 30 },
};

const TREND_STALE_TIME_MS = 1000 * 60 * 10;
const TREND_GC_TIME_MS = 1000 * 60 * 60 * 12;

interface UseSiteTrendDataOptions {
  siteId?: string;
  period?: TrendPeriod;
  pollutant?: PollutantType;
  enabled?: boolean;
}

const toDateKey = (date: Date): string => date.toISOString().split('T')[0];

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
  period = '24H',
  pollutant = 'pm2_5',
  enabled = true,
}: UseSiteTrendDataOptions = {}) => {
  const config = PERIOD_CONFIG[period];

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date(end.getTime() - config.days * 24 * 60 * 60 * 1000);
    return {
      startDate: toDateKey(start),
      endDate: toDateKey(end),
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
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          chartType: 'line',
          frequency: config.frequency,
          pollutant: pollutant.toLowerCase().replace('.', '_'),
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
