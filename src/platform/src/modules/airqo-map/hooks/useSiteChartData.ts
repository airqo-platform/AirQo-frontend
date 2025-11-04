'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGetChartData } from '@/shared/hooks/useAnalytics';
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
  const { trigger: getChartData, isMutating } = useGetChartData();

  const [chartData, setChartData] = useState<NormalizedChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch chart data function
  const fetchChartData = useCallback(async () => {
    if (!siteId || !enabled) {
      setChartData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getChartData({
        sites: [siteId],
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        chartType: 'line', // Default to line, can be overridden in chart config
        frequency: frequency,
        pollutant: pollutant.toLowerCase().replace('.', '_'),
        organisation_name: '',
      });

      if (
        response?.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        // Transform API data to chart format
        const transformed = normalizeAirQualityData(
          response.data as ChartDataPoint[]
        );
        setChartData(transformed);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error('Error fetching site chart data:', err);
      setError('Failed to fetch chart data');
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    siteId,
    dateRange.startDate,
    dateRange.endDate,
    frequency,
    pollutant,
    getChartData,
    enabled,
  ]);

  // Refresh data function
  const refresh = useCallback(async () => {
    return fetchChartData();
  }, [fetchChartData]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return {
    chartData,
    isLoading: isLoading || isMutating,
    error,
    refresh,
    // Metadata
    hasData: chartData.length > 0,
    siteId,
    pollutant,
    frequency,
    dateRange,
  };
};
