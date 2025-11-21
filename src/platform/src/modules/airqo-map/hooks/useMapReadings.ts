'use client';
import { useState, useEffect } from 'react';
import { deviceService } from '../../../shared/services/deviceService';
import type {
  MapReadingsResponse,
  MapReading,
} from '../../../shared/types/api';

export interface UseMapReadingsResult {
  readings: MapReading[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching map readings data
 */
export function useMapReadings(): UseMapReadingsResult {
  const [readings, setReadings] = useState<MapReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: MapReadingsResponse =
        await deviceService.getMapReadingsAuthenticated();
      setReadings(response.measurements);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch map readings'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  return {
    readings,
    isLoading,
    error,
    refetch: fetchReadings,
  };
}
