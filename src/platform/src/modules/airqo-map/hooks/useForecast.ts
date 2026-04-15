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
}: UseForecastParams = {}): UseForecastResult {
  const shouldFetchFromApi = Boolean(siteId && enabled);

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
    networkMode: 'online',
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60 * 12,
  });

  const forecast = useMemo(() => {
    if (!siteId || !enabled) {
      return [];
    }

    return data?.forecasts ?? [];
  }, [data?.forecasts, enabled, siteId]);

  const aqiRanges = useMemo<AQIRanges | null>(() => {
    if (!siteId || !enabled) {
      return null;
    }

    return data?.aqi_ranges ?? null;
  }, [data?.aqi_ranges, enabled, siteId]);

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
