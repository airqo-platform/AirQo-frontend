'use client';
import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { deviceService } from '../../../shared/services/deviceService';
import type {
  DailyForecastResponse,
  DailyForecastSite,
  DailyForecastItem,
  HourlyForecastResponse,
  HourlyForecastSite,
  HourlyForecastItem,
} from '../../../shared/types/api';

export type ForecastMode = 'daily' | 'hourly';

export interface UseForecastParams {
  siteId?: string;
  mode?: ForecastMode;
  enabled?: boolean;
  hourlyPage?: number;
  hourlyLimit?: number;
}

export interface UseForecastResult {
  dailyForecasts: DailyForecastSite[];
  hourlyForecasts: HourlyForecastSite[];
  dailyItems: DailyForecastItem[];
  hourlyItems: HourlyForecastItem[];
  siteName: string | null;
  units: Record<string, string> | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching daily or hourly forecast data for a specific site.
 * Uses the new v2 forecasting API endpoints.
 */
export function useForecast({
  siteId,
  mode = 'daily',
  enabled = true,
  hourlyPage = 1,
  hourlyLimit = 24,
}: UseForecastParams = {}): UseForecastResult {
  const shouldFetchFromApi = Boolean(siteId && enabled);

  // ── Daily query ────────────────────────────────────────────────────────────
  const dailyQuery = useQuery<DailyForecastResponse, Error>({
    queryKey: ['map', 'forecast', 'daily', siteId ?? 'none'],
    queryFn: async () => {
      if (!siteId) throw new Error('Site ID is required');
      return deviceService.getDailyForecast(siteId);
    },
    enabled: shouldFetchFromApi && mode === 'daily',
    networkMode: 'online',
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60 * 12,
  });

  // ── Hourly query ───────────────────────────────────────────────────────────
  const hourlyQuery = useQuery<HourlyForecastResponse, Error>({
    queryKey: [
      'map',
      'forecast',
      'hourly',
      siteId ?? 'none',
      hourlyPage,
      hourlyLimit,
    ],
    queryFn: async () => {
      if (!siteId) throw new Error('Site ID is required');
      return deviceService.getHourlyForecast(siteId, hourlyPage, hourlyLimit);
    },
    enabled: shouldFetchFromApi && mode === 'hourly',
    networkMode: 'online',
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60 * 12,
  });

  const activeQuery = mode === 'daily' ? dailyQuery : hourlyQuery;

  // ── Derived state ──────────────────────────────────────────────────────────
  const dailyForecasts = useMemo<DailyForecastSite[]>(() => {
    if (!siteId || !enabled) return [];
    return dailyQuery.data?.data?.forecasts ?? [];
  }, [dailyQuery.data?.data?.forecasts, enabled, siteId]);

  const hourlyForecasts = useMemo<HourlyForecastSite[]>(() => {
    if (!siteId || !enabled) return [];
    return hourlyQuery.data?.data?.forecasts ?? [];
  }, [hourlyQuery.data?.data?.forecasts, enabled, siteId]);

  const dailyItems = useMemo<DailyForecastItem[]>(() => {
    if (dailyForecasts.length === 0) return [];
    return dailyForecasts[0]?.forecasts ?? [];
  }, [dailyForecasts]);

  const hourlyItems = useMemo<HourlyForecastItem[]>(() => {
    if (hourlyForecasts.length === 0) return [];
    return hourlyForecasts[0]?.forecasts ?? [];
  }, [hourlyForecasts]);

  const siteName = useMemo<string | null>(() => {
    if (mode === 'daily' && dailyForecasts.length > 0) {
      return dailyForecasts[0]?.site_details?.site_name ?? null;
    }
    if (mode === 'hourly' && hourlyForecasts.length > 0) {
      return hourlyForecasts[0]?.site_details?.site_name ?? null;
    }
    return null;
  }, [mode, dailyForecasts, hourlyForecasts]);

  const units = useMemo<Record<string, string> | null>(() => {
    if (mode === 'daily' && dailyQuery.data?.data?.units) {
      return dailyQuery.data.data.units as unknown as Record<string, string>;
    }
    if (mode === 'hourly' && hourlyQuery.data?.data?.units) {
      return hourlyQuery.data.data.units as unknown as Record<string, string>;
    }
    return null;
  }, [mode, dailyQuery.data?.data?.units, hourlyQuery.data?.data?.units]);

  const refetch = useCallback(async () => {
    if (!shouldFetchFromApi) return;
    if (mode === 'daily') {
      await dailyQuery.refetch();
    } else {
      await hourlyQuery.refetch();
    }
  }, [shouldFetchFromApi, mode, dailyQuery, hourlyQuery]);

  return {
    dailyForecasts,
    hourlyForecasts,
    dailyItems,
    hourlyItems,
    siteName,
    units,
    isLoading: shouldFetchFromApi ? activeQuery.isLoading : false,
    error: shouldFetchFromApi ? (activeQuery.error?.message ?? null) : null,
    refetch,
  };
}
