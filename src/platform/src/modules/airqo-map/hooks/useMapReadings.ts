'use client';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
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

const getSessionUserId = (session: unknown): string | null => {
  if (!session || typeof session !== 'object') {
    return null;
  }

  const user = (session as { user?: { _id?: unknown } }).user;
  if (!user || typeof user !== 'object') {
    return null;
  }

  const userId = typeof user._id === 'string' ? user._id.trim() : '';
  return userId || null;
};

/**
 * Hook for fetching map readings data
 * @param cohort_id - Optional comma-separated cohort IDs for filtering
 */
export function useMapReadings(
  cohort_id?: string | null
): UseMapReadingsResult {
  const { data: session, status: sessionStatus } = useSession();
  const sessionUserId = getSessionUserId(session);
  const normalizedCohortId =
    cohort_id === null ? 'disabled' : (cohort_id ?? 'all');
  const isCohortScopedRequest = Boolean(cohort_id);
  const waitingForSessionUser =
    isCohortScopedRequest && sessionStatus === 'loading';
  const enabled = cohort_id !== null && !waitingForSessionUser;

  const sessionScopeKey = isCohortScopedRequest
    ? waitingForSessionUser
      ? 'loading'
      : sessionUserId
        ? `user:${sessionUserId}`
        : 'anonymous'
    : 'public';

  const {
    data: readings = [],
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery<MapReading[], Error>({
    queryKey: ['map', 'readings', normalizedCohortId, sessionScopeKey],
    queryFn: async () => {
      const response: MapReadingsResponse =
        await deviceService.getMapReadingsWithToken(
          cohort_id || undefined,
          sessionUserId || undefined
        );
      return response.measurements;
    },
    enabled,
    networkMode: 'online',
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 60 * 12,
  });

  const refetch = useCallback(async () => {
    await refetchQuery();
  }, [refetchQuery]);

  const noopRefetch = useCallback(async () => undefined, []);

  if (!enabled) {
    if (waitingForSessionUser) {
      return {
        readings: [],
        isLoading: true,
        error: null,
        refetch: noopRefetch,
      };
    }

    return {
      readings: [],
      isLoading: false,
      error: null,
      refetch: noopRefetch,
    };
  }

  return {
    readings,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
