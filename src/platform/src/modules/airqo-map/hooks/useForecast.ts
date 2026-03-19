'use client';
import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { deviceService } from '../../../shared/services/deviceService';
import type {
  ForecastResponse,
  ForecastData,
  AQIRanges,
} from '../../../shared/types/api';

export interface UseForecastParams {
  siteId?: string;
  enabled?: boolean;
  waqiForecastData?: ForecastData[];
}

export interface UseForecastResult {
  forecast: ForecastData[];
  aqiRanges: AQIRanges | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching forecast data for a specific site
 */
export function useForecast({
  siteId,
  enabled = true,
  waqiForecastData,
}: UseForecastParams = {}): UseForecastResult {
  const isWaqiSite = Boolean(siteId?.startsWith('waqi-'));
  const shouldFetchFromApi = Boolean(siteId && enabled && !isWaqiSite);

  const {
    data,
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery<ForecastResponse, Error>({
    queryKey: ['map', 'forecast', siteId ?? 'none'],
    queryFn: async () => {
      if (!siteId) {
        throw new Error('Site ID is required');
      }
      return deviceService.getForecastAuthenticated(siteId);
    },
    enabled: shouldFetchFromApi,
    networkMode: 'offlineFirst',
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60 * 12,
  });

  const forecast = useMemo(() => {
    if (!siteId || !enabled) {
      return [];
    }

    if (isWaqiSite) {
      return waqiForecastData || [];
    }

    return data?.forecasts ?? [];
  }, [data?.forecasts, enabled, isWaqiSite, siteId, waqiForecastData]);

  const aqiRanges = useMemo<AQIRanges | null>(() => {
    if (!siteId || !enabled || isWaqiSite) {
      return null;
    }

    return data?.aqi_ranges ?? null;
  }, [data?.aqi_ranges, enabled, isWaqiSite, siteId]);

  const refetch = useCallback(async () => {
    if (!shouldFetchFromApi) return;
    await refetchQuery();
  }, [refetchQuery, shouldFetchFromApi]);

  return {
    forecast,
    aqiRanges,
    isLoading: shouldFetchFromApi ? isLoading : false,
    error: shouldFetchFromApi ? (error?.message ?? null) : null,
    refetch,
  };
}
