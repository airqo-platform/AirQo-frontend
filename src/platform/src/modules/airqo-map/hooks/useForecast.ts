'use client';
import { useState, useEffect, useCallback } from 'react';
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
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [aqiRanges, setAqiRanges] = useState<AQIRanges | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear data when siteId changes to prevent stale data
  useEffect(() => {
    setForecast([]);
    setAqiRanges(null);
    setError(null);
    setIsLoading(false);
  }, [siteId]);

  const fetchForecast = useCallback(async () => {
    if (!siteId || !enabled) {
      // Clear data when no siteId or disabled
      setForecast([]);
      setAqiRanges(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Check if this is a WAQI site - always use embedded forecast data if available
    if (siteId.startsWith('waqi-')) {
      setIsLoading(false);
      setError(null);
      setForecast(waqiForecastData || []);
      setAqiRanges(null); // WAQI doesn't provide AQI ranges
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setForecast([]); // Clear previous forecast data
      const response: ForecastResponse =
        await deviceService.getForecastAuthenticated(siteId);
      setForecast(response.forecasts);
      setAqiRanges(response.aqi_ranges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast');
      setForecast([]); // Clear forecast on error
      setAqiRanges(null);
    } finally {
      setIsLoading(false);
    }
  }, [siteId, enabled, waqiForecastData]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return {
    forecast,
    aqiRanges,
    isLoading,
    error,
    refetch: fetchForecast,
  };
}
