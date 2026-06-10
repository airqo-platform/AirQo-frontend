'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { deviceService } from '../../../shared/services/deviceService';
import type {
  MapReadingsResponse,
  MapReading,
} from '../../../shared/types/api';

const MAP_READINGS_AUTO_RETRY_DELAY_MS = 750;

const isAbortLikeError = (error: unknown): boolean => {
  const candidate = error as {
    name?: string;
    code?: string;
    message?: string;
  } | null;

  if (!candidate) {
    return false;
  }

  return (
    candidate.name === 'AbortError' ||
    candidate.name === 'CanceledError' ||
    candidate.code === 'ERR_CANCELED' ||
    candidate.message === 'canceled'
  );
};

const getErrorStatus = (error: unknown): number | null => {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const candidate = error as {
    status?: number;
    response?: { status?: number };
  };

  if (typeof candidate.response?.status === 'number') {
    return candidate.response.status;
  }

  return typeof candidate.status === 'number' ? candidate.status : null;
};

const shouldAutoRetryMapReadings = (error: unknown): boolean => {
  if (isAbortLikeError(error)) {
    return true;
  }

  const status = getErrorStatus(error);
  return status !== null && status >= 500 && status < 600;
};

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
  const normalizedCohortId =
    cohort_id === null ? 'disabled' : (cohort_id ?? 'all');
  const enabled = cohort_id !== null;
  const autoRetriedKeyRef = useRef<string | null>(null);

  const {
    data: readings = [],
    isLoading,
    isFetching,
    error,
    refetch: refetchQuery,
  } = useQuery<MapReading[], Error>({
    queryKey: ['map', 'readings', normalizedCohortId],
    queryFn: async ({ signal }) => {
      const response: MapReadingsResponse =
        await deviceService.getMapReadingsWithToken(
          cohort_id || undefined,
          signal
        );
      return response.measurements;
    },
    enabled,
    networkMode: 'online',
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 60 * 12,
  });

  useEffect(() => {
    autoRetriedKeyRef.current = null;
  }, [normalizedCohortId]);

  useEffect(() => {
    if (!enabled || !error || !shouldAutoRetryMapReadings(error)) {
      return;
    }

    if (autoRetriedKeyRef.current === normalizedCohortId) {
      return;
    }

    autoRetriedKeyRef.current = normalizedCohortId;

    const retryTimer = window.setTimeout(() => {
      void refetchQuery();
    }, MAP_READINGS_AUTO_RETRY_DELAY_MS);

    return () => {
      window.clearTimeout(retryTimer);
    };
  }, [enabled, error, normalizedCohortId, refetchQuery]);

  const refetch = useCallback(async () => {
    await refetchQuery();
  }, [refetchQuery]);

  const noopRefetch = useCallback(async () => undefined, []);

  if (!enabled) {
    return {
      readings: [],
      isLoading: false,
      error: null,
      refetch: noopRefetch,
    };
  }

  return {
    readings,
    isLoading: isLoading || (readings.length === 0 && isFetching),
    error: error?.message ?? null,
    refetch,
  };
}
