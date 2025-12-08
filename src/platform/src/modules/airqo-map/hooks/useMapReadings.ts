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
export function useMapReadings(
  cohort_id?: string | null
): UseMapReadingsResult {
  const [readings, setReadings] = useState<MapReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = async () => {
    // If cohort_id is null, it means we are waiting for it to be determined (e.g. in org flow)
    if (cohort_id === null) {
      return;
    }

    // If cohort_id is empty string, it means we checked and there are no cohorts, so no readings
    if (cohort_id === '') {
      setReadings([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response: MapReadingsResponse =
        await deviceService.getMapReadingsAuthenticated(cohort_id);
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
  }, [cohort_id]);

  return {
    readings,
    isLoading,
    error,
    refetch: fetchReadings,
  };
}
