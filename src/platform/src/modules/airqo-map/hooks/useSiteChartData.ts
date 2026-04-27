'use client';

import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/shared/services/analyticsService';
import { normalizeAirQualityData } from '@/shared/components/charts/utils';
import type { ChartDataPoint } from '@/shared/types/api';
import type { NormalizedChartData } from '@/shared/components/charts/types';
import type {
  FrequencyType,
  PollutantType,
} from '@/shared/components/charts/types';

interface UseSiteChartDataOptions {
  siteId?: string;
  pollutant?: PollutantType;
  frequency?: FrequencyType;
  startDate?: string;
  endDate?: string;
  days?: number; // For backward compatibility, but prefer startDate/endDate
  enabled?: boolean;
}

/**
 * Hook for fetching chart data for a specific site
 * Used in map sidebar to display site-specific insights
 */
export const useSiteChartData = ({
  siteId,
  pollutant = 'pm2_5',
  frequency = 'daily',
  startDate,
  endDate,
  days = 7,
  enabled = true,
}: UseSiteChartDataOptions = {}) => {
  // Calculate date range based on startDate/endDate or days parameter
  const dateRange = useMemo(() => {
    if (startDate && endDate) {
      return {
        startDate,
        endDate,
      };
    }

    // Fallback to days calculation
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days || 7));

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  }, [startDate, endDate, days]);

  const shouldFetch = Boolean(siteId && enabled);

  const {
    data: chartData = [],
    isLoading,
    isFetching,
    error,
    refetch: refetchQuery,
  } = useQuery<NormalizedChartData[], Error>({
    queryKey: [
      'map',
      'site-chart-data',
      siteId ?? 'none',
      dateRange.startDate,
      dateRange.endDate,
      frequency,
      pollutant,
    ],
    queryFn: async ({ signal }) => {
      if (!siteId) {
        return [];
      }

      const response = await analyticsService.getChartData(
        {
          sites: [siteId],
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          chartType: 'line',
          frequency,
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
    retry: false,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60 * 12,
  });

  // Refresh data function
  const refresh = useCallback(async () => {
    if (!shouldFetch) return;
    await refetchQuery();
  }, [refetchQuery, shouldFetch]);

  const gatedChartData = shouldFetch ? chartData : [];

  return {
    chartData: gatedChartData,
    isLoading: shouldFetch ? isLoading || isFetching : false,
    error: shouldFetch ? (error?.message ?? null) : null,
    refresh,
    // Metadata
    hasData: gatedChartData.length > 0,
    siteId,
    pollutant,
    frequency,
    dateRange,
  };
};
