'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { deviceService } from '../../../shared/services/deviceService';
import { isAbortError, boundedRetryPolicy } from '@/shared/lib/retryPolicy';
import { normalizeSpatialHeatmaps } from '@/modules/airqo-map/utils/spatialHeatmaps';
import type { SpatialHeatmap } from '../../../shared/types/api';

const HEATMAP_STALE_TIME_MS = 45 * 60 * 1000;
const HEATMAP_GC_TIME_MS = 12 * 60 * 60 * 1000;

export interface UseSpatialHeatmapsResult {
  heatmaps: SpatialHeatmap[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Fetches the documented all-city heatmap collection once per session scope.
 * Heatmaps are regenerated periodically, so a 45-minute client cache keeps
 * the map useful while avoiding a request on every map mount or refresh.
 */
export function useSpatialHeatmaps(enabled = true): UseSpatialHeatmapsResult {
  const { data: session, status: sessionStatus } = useSession();
  const sessionUser = session?.user as
    | { id?: string; _id?: string; email?: string | null }
    | undefined;
  const stableUserId =
    sessionUser?.id || sessionUser?._id || sessionUser?.email || null;
  const requestEnabled =
    enabled && sessionStatus === 'authenticated' && Boolean(stableUserId);
  const sessionScope = stableUserId || 'pending';

  const {
    data: heatmaps = [],
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery<SpatialHeatmap[], Error>({
    queryKey: ['map', 'spatial-heatmaps', sessionScope],
    queryFn: async ({ signal }) => {
      const response = await deviceService.getSpatialHeatmapsWithToken(signal);
      return normalizeSpatialHeatmaps(response);
    },
    enabled: requestEnabled,
    networkMode: 'online',
    ...boundedRetryPolicy,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    staleTime: HEATMAP_STALE_TIME_MS,
    gcTime: HEATMAP_GC_TIME_MS,
  });

  const refetch = useCallback(async () => {
    if (!requestEnabled) return;
    await refetchQuery();
  }, [refetchQuery, requestEnabled]);

  const noopRefetch = useCallback(async () => undefined, []);

  if (!requestEnabled) {
    return {
      heatmaps: [],
      isLoading: sessionStatus === 'loading',
      error: null,
      refetch: noopRefetch,
    };
  }

  return {
    heatmaps,
    isLoading,
    error: error && !isAbortError(error) ? error.message : null,
    refetch,
  };
}
