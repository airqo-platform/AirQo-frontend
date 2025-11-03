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
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [aqiRanges, setAqiRanges] = useState<AQIRanges | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = useCallback(async () => {
    if (!siteId || !enabled) return;

    try {
      setIsLoading(true);
      setError(null);
      const response: ForecastResponse =
        await deviceService.getForecastAuthenticated(siteId);
      setForecast(response.forecasts);
      setAqiRanges(response.aqi_ranges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast');
    } finally {
      setIsLoading(false);
    }
  }, [siteId, enabled]);

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
