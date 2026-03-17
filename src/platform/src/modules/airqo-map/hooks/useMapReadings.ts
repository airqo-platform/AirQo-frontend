'use client';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
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
 * @param cohort_id - Optional comma-separated cohort IDs for filtering
 */
export function useMapReadings(
  cohort_id?: string | null
): UseMapReadingsResult {
  const enabled = cohort_id !== null;

  const {
    data: readings = [],
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery<MapReading[], Error>({
    queryKey: ['map', 'readings', cohort_id ?? 'all'],
    queryFn: async () => {
      if (cohort_id === '') {
        return [];
      }

      const response: MapReadingsResponse =
        await deviceService.getMapReadingsWithToken(cohort_id ?? undefined);
      return response.measurements;
    },
    enabled,
    networkMode: 'offlineFirst',
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 60 * 12,
  });

  const refetch = useCallback(async () => {
    await refetchQuery();
  }, [refetchQuery]);

  return {
    readings,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
