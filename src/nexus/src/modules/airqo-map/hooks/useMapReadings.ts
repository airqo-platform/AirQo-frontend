'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
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

const isNetworkError = (error: unknown): boolean => {
  const candidate = error as { code?: string } | null;
  return candidate?.code === 'ERR_NETWORK';
};

const shouldAutoRetryMapReadings = (error: unknown): boolean => {
  if (isAbortLikeError(error)) {
    return false;
  }

  if (isNetworkError(error)) {
    return false;
  }

  // Only retry when there is no HTTP status — truly unknown/transient errors.
  // Don't retry 4xx/5xx since those are unlikely to succeed on retry.
  const status = getErrorStatus(error);
  if (status !== null) {
    return false;
  }

  return true;
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
  const { data: session, status: sessionStatus } = useSession();
  const normalizedCohortId =
    cohort_id === null ? 'disabled' : (cohort_id ?? 'all');
  const enabled = cohort_id !== null;
  const sessionUser = session?.user as
    | { id?: string; _id?: string; email?: string | null }
    | undefined;
  const sessionScope =
    sessionUser?.id ||
    sessionUser?._id ||
    sessionUser?.email ||
    (sessionStatus === 'authenticated' ? 'authenticated' : 'pending');
  const requestEnabled = enabled && sessionStatus === 'authenticated';
  const queryScope = `${sessionScope}:${normalizedCohortId}`;
  const autoRetriedKeyRef = useRef<string | null>(null);

  const {
    data: readings = [],
    isLoading,
    isFetching,
    error,
    refetch: refetchQuery,
  } = useQuery<MapReading[], Error>({
    queryKey: ['map', 'readings', sessionScope, normalizedCohortId],
    queryFn: async ({ signal }) => {
      const response: MapReadingsResponse =
        await deviceService.getMapReadingsWithToken(
          cohort_id || undefined,
          signal
        );
      return response.measurements;
    },
    enabled: requestEnabled,
    networkMode: 'online',
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // A map view should always validate its readings when it mounts. Cached
    // data is still used immediately while the request is in flight.
    refetchOnMount: 'always',
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 60 * 12,
  });

  useEffect(() => {
    autoRetriedKeyRef.current = null;
  }, [queryScope]);

  useEffect(() => {
    if (!requestEnabled || !error || !shouldAutoRetryMapReadings(error)) {
      return;
    }

    if (autoRetriedKeyRef.current === queryScope) {
      return;
    }

    autoRetriedKeyRef.current = queryScope;

    const retryTimer = window.setTimeout(() => {
      void refetchQuery();
    }, MAP_READINGS_AUTO_RETRY_DELAY_MS);

    return () => {
      window.clearTimeout(retryTimer);
    };
  }, [queryScope, error, refetchQuery, requestEnabled]);

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
    // Keep the map covered until authentication and the first readings
    // request are both ready. This prevents an initial blank map during the
    // login/session hand-off.
    isLoading:
      sessionStatus === 'loading' ||
      (requestEnabled && (isLoading || (readings.length === 0 && isFetching))),
    error: requestEnabled ? (error?.message ?? null) : null,
    refetch,
  };
}
