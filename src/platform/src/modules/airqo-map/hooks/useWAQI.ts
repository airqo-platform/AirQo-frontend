import { useState, useEffect, useCallback, useMemo } from 'react';
import { waqiService } from '../services/waqiService';
import type { WAQICityResponse } from '../types/waqi';
import { normalizeWAQIReadings } from '../utils/dataNormalization';
import type { AirQualityReading } from '../components/map/MapNodes';

export interface UseWAQICitiesResult {
  citiesReadings: AirQualityReading[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching WAQI data for multiple cities
 * @param cities - Array of city names
 */
export function useWAQICities(cities: string[]): UseWAQICitiesResult {
  const [citiesReadings, setCitiesReadings] = useState<AirQualityReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize cities to prevent infinite re-renders
  const memoizedCities = useMemo(() => cities, [cities]);

  const fetchCities = useCallback(async () => {
    if (!waqiService || memoizedCities.length === 0) {
      setCitiesReadings([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await waqiService.getMultipleCitiesData(memoizedCities);

      // Convert to the format expected by normalizeWAQIReadings
      const formattedData = data
        .map((item, index) =>
          item ? { city: memoizedCities[index], data: item } : null
        )
        .filter(item => item !== null) as Array<{
        city: string;
        data: WAQICityResponse['data'];
      }>;

      const readings = normalizeWAQIReadings(formattedData);
      setCitiesReadings(readings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch WAQI cities data'
      );
      setCitiesReadings([]);
    } finally {
      setIsLoading(false);
    }
  }, [memoizedCities]); // Only depend on memoizedCities

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  return {
    citiesReadings,
    isLoading,
    error,
    refetch: fetchCities,
  };
}
