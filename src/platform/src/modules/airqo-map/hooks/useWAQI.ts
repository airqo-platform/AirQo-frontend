'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
 * Hook for fetching WAQI data for multiple cities with progressive loading
 * Cities are loaded in batches and added to the map progressively to avoid blocking UI
 * @param cities - Array of city names
 * @param batchSize - Number of cities to load per batch (default: 15)
 * @param batchDelay - Delay between batches in ms (default: 300)
 */
export function useWAQICities(
  cities: string[],
  batchSize: number = 15,
  batchDelay: number = 300
): UseWAQICitiesResult {
  const [citiesReadings, setCitiesReadings] = useState<AirQualityReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Memoize cities to prevent infinite re-renders
  const memoizedCities = useMemo(() => cities, [cities]);

  const fetchCitiesProgressive = useCallback(async () => {
    if (!waqiService || memoizedCities.length === 0) {
      setCitiesReadings([]);
      return;
    }

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this batch
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      // Don't clear existing readings - keep them while loading new ones
      const totalBatches = Math.ceil(memoizedCities.length / batchSize);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        // Check if component is still mounted and request wasn't cancelled
        if (
          !isMountedRef.current ||
          abortControllerRef.current?.signal.aborted
        ) {
          break;
        }

        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(
          startIndex + batchSize,
          memoizedCities.length
        );
        const batchCities = memoizedCities.slice(startIndex, endIndex);

        try {
          const data = await waqiService.getMultipleCitiesData(
            batchCities,
            abortControllerRef.current.signal
          );

          // Check again if still mounted after API call
          if (
            !isMountedRef.current ||
            abortControllerRef.current?.signal.aborted
          ) {
            break;
          }

          // Convert to the format expected by normalizeWAQIReadings
          const formattedData = data
            .map((item, index) =>
              item ? { city: batchCities[index], data: item } : null
            )
            .filter(item => item !== null) as Array<{
            city: string;
            data: WAQICityResponse['data'];
          }>;

          const newReadings = normalizeWAQIReadings(formattedData);

          // Add new readings progressively without clearing existing ones
          setCitiesReadings(prev => [...prev, ...newReadings]);
        } catch (batchError) {
          // Log error but continue with next batch
          console.warn(`Error loading batch ${batchIndex + 1}:`, batchError);
        }

        // Add delay between batches (except for the last batch)
        if (batchIndex < totalBatches - 1 && isMountedRef.current) {
          await new Promise(resolve => setTimeout(resolve, batchDelay));
        }
      }
    } catch (err) {
      if (
        isMountedRef.current &&
        err instanceof Error &&
        err.name !== 'AbortError'
      ) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch WAQI cities data'
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [memoizedCities, batchSize, batchDelay]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Reset readings when cities change
  useEffect(() => {
    setCitiesReadings([]);
    if (memoizedCities.length > 0) {
      fetchCitiesProgressive();
    }
  }, [fetchCitiesProgressive, memoizedCities.length]);

  return {
    citiesReadings,
    isLoading,
    error,
    refetch: fetchCitiesProgressive,
  };
}
