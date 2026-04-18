import useSWR, { mutate } from 'swr';
import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deviceService } from '../services/deviceService';
import {
  setCohortsError,
  setActiveGroupCohorts,
  clearCohorts,
} from '../store/cohortSlice';
import {
  selectActiveGroupCohorts,
  selectCohortsError,
  selectLastFetchedGroupId,
  selectActiveGroup,
} from '../store/selectors';
import type {
  SitesSummaryResponse,
  SitesSummaryParams,
  CohortSitesParams,
  CohortSitesResponse,
  CohortDevicesParams,
  CohortDevicesResponse,
  GroupCohortsResponse,
  GridsSummaryResponse,
  GridsSummaryParams,
  CohortResponse,
} from '../types/api';
import { normalizeCohortIds } from '../utils/cohortUtils';

const SWR_STABLE_REQUEST_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
  dedupingInterval: 5000,
} as const;

const isAbortError = (error: unknown): boolean => {
  const candidate = error as { name?: string; code?: string } | null;
  if (!candidate) return false;
  return (
    candidate.name === 'AbortError' ||
    candidate.name === 'CanceledError' ||
    candidate.code === 'ERR_CANCELED'
  );
};

const useAbortableFetcher = <T>(
  fetcher: (signal: AbortSignal) => Promise<T>
) => {
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      return await fetcher(controller.signal);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [fetcher]);
};

export interface ActiveGroupCohortsState {
  cohortIds: string[];
  isLoading: boolean;
}

const useCohortSitesQuery = (
  cohortIds: string[],
  params: CohortSitesParams = {},
  enabled = true,
  cohortsLoading = false
) => {
  const shouldFetch = enabled && cohortIds.length > 0 && !cohortsLoading;

  const key = shouldFetch
    ? ['cohort/sites/active-group', cohortIds, params]
    : null;

  const cohortSitesFetcher = useCallback(
    (signal: AbortSignal) =>
      deviceService.getCohortSites({ cohort_ids: cohortIds }, params, signal),
    [cohortIds, params]
  );
  const fetchCohortSites = useAbortableFetcher(cohortSitesFetcher);

  const result = useSWR<CohortSitesResponse>(key, fetchCohortSites, {
    ...SWR_STABLE_REQUEST_OPTIONS,
    isPaused: () => cohortsLoading,
  });
  const resolvedError = isAbortError(result.error) ? null : result.error;

  return {
    ...result,
    error: resolvedError,
    isLoading: result.isLoading || cohortsLoading,
    cohortIds,
  };
};

const useCohortDevicesQuery = (
  cohortIds: string[],
  params: CohortDevicesParams = {},
  enabled = true,
  cohortsLoading = false
) => {
  const shouldFetch = enabled && cohortIds.length > 0 && !cohortsLoading;

  const key = shouldFetch
    ? ['cohort/devices/active-group', cohortIds, params]
    : null;

  const cohortDevicesFetcher = useCallback(
    (signal: AbortSignal) =>
      deviceService.getCohortDevices({ cohort_ids: cohortIds }, params, signal),
    [cohortIds, params]
  );
  const fetchCohortDevices = useAbortableFetcher(cohortDevicesFetcher);

  const result = useSWR<CohortDevicesResponse>(key, fetchCohortDevices, {
    ...SWR_STABLE_REQUEST_OPTIONS,
    isPaused: () => cohortsLoading,
  });
  const resolvedError = isAbortError(result.error) ? null : result.error;

  return {
    ...result,
    error: resolvedError,
    isLoading: result.isLoading || cohortsLoading,
    cohortIds,
  };
};

// Authenticated sites summary hook
export const useSitesSummary = (
  params: SitesSummaryParams = {},
  enabled = true
) => {
  const key = enabled ? ['sites/summary', params] : null;
  const fetcher = useAbortableFetcher(
    useCallback(
      (signal: AbortSignal) =>
        deviceService.getSitesSummaryAuthenticated(params, signal),
      [params]
    )
  );

  return useSWR<SitesSummaryResponse>(key, fetcher, SWR_STABLE_REQUEST_OPTIONS);
};

// Token-based sites summary hook
export const useSitesSummaryWithToken = (
  params: SitesSummaryParams = {},
  enabled = true
) => {
  const key = enabled ? ['sites/summary/token', params] : null;
  const fetcher = useAbortableFetcher(
    useCallback(
      (signal: AbortSignal) =>
        deviceService.getSitesSummaryWithToken(params, signal),
      [params]
    )
  );

  return useSWR<SitesSummaryResponse>(key, fetcher, SWR_STABLE_REQUEST_OPTIONS);
};

// Authenticated grids summary hook
export const useGridsSummary = (
  params: GridsSummaryParams = {},
  cohort_id?: string,
  enabled = true
) => {
  const key = enabled ? ['grids/summary', params, cohort_id] : null;
  const fetcher = useAbortableFetcher(
    useCallback(
      (signal: AbortSignal) =>
        deviceService.getGridsSummaryAuthenticated(params, cohort_id, signal),
      [params, cohort_id]
    )
  );

  return useSWR<GridsSummaryResponse>(key, fetcher, SWR_STABLE_REQUEST_OPTIONS);
};

// Token-based grids summary hook
export const useGridsSummaryWithToken = (
  params: GridsSummaryParams = {},
  cohort_id?: string,
  enabled = true
) => {
  const key = enabled ? ['grids/summary/token', params, cohort_id] : null;
  const fetcher = useAbortableFetcher(
    useCallback(
      (signal: AbortSignal) =>
        deviceService.getGridsSummaryWithToken(params, cohort_id, signal),
      [params, cohort_id]
    )
  );

  return useSWR<GridsSummaryResponse>(key, fetcher, SWR_STABLE_REQUEST_OPTIONS);
};

// Cohort sites hook
export const useCohortSites = (
  cohortIds: string[],
  params: CohortSitesParams = {},
  enabled = true
) => {
  const cohortSitesFetcher = useCallback(
    (signal: AbortSignal) =>
      deviceService.getCohortSites({ cohort_ids: cohortIds }, params, signal),
    [cohortIds, params]
  );
  const fetchCohortSites = useAbortableFetcher(cohortSitesFetcher);

  const result = useSWR<CohortSitesResponse>(
    enabled && cohortIds.length > 0
      ? ['cohort/sites', cohortIds, params]
      : null,
    fetchCohortSites,
    SWR_STABLE_REQUEST_OPTIONS
  );

  return {
    ...result,
    error: isAbortError(result.error) ? null : result.error,
  };
};

// Enhanced cohort sites hook with automatic active group cohorts
export const useActiveGroupCohortSites = (
  params: CohortSitesParams = {},
  enabled = true
) => {
  const { cohortIds, isLoading: cohortsLoading } =
    useActiveGroupCohorts(enabled);

  return useCohortSitesQuery(cohortIds, params, enabled, cohortsLoading);
};

export const useActiveGroupCohortSitesWithState = (
  params: CohortSitesParams = {},
  enabled = true,
  activeGroupCohorts: ActiveGroupCohortsState
) => {
  return useCohortSitesQuery(
    activeGroupCohorts.cohortIds,
    params,
    enabled,
    activeGroupCohorts.isLoading
  );
};

// Cohort devices hook
export const useCohortDevices = (
  cohortIds: string[],
  params: CohortDevicesParams = {},
  enabled = true
) => {
  const cohortDevicesFetcher = useCallback(
    (signal: AbortSignal) =>
      deviceService.getCohortDevices({ cohort_ids: cohortIds }, params, signal),
    [cohortIds, params]
  );
  const fetchCohortDevices = useAbortableFetcher(cohortDevicesFetcher);

  const result = useSWR<CohortDevicesResponse>(
    enabled && cohortIds.length > 0
      ? ['cohort/devices', cohortIds, params]
      : null,
    fetchCohortDevices,
    SWR_STABLE_REQUEST_OPTIONS
  );

  return {
    ...result,
    error: isAbortError(result.error) ? null : result.error,
  };
};

// Group cohorts hook
export const useGroupCohorts = (groupId: string, enabled = true) => {
  const key = enabled && groupId ? ['group/cohorts', groupId] : null;
  const fetcher = useAbortableFetcher(
    useCallback(
      (signal: AbortSignal) => deviceService.getGroupCohorts(groupId, signal),
      [groupId]
    )
  );

  return useSWR<GroupCohortsResponse>(key, fetcher, SWR_STABLE_REQUEST_OPTIONS);
};

// Cohort details hook
export const useCohort = (cohortId: string, enabled = true) => {
  const key = enabled && cohortId ? ['cohort/details', cohortId] : null;
  const fetcher = useAbortableFetcher(
    useCallback(
      (signal: AbortSignal) => deviceService.getCohort(cohortId, signal),
      [cohortId]
    )
  );

  return useSWR<CohortResponse>(key, fetcher, {
    ...SWR_STABLE_REQUEST_OPTIONS,
  });
};

// Enhanced cohort devices hook with automatic active group cohorts
export const useActiveGroupCohortDevices = (
  params: CohortDevicesParams = {},
  enabled = true
) => {
  const { cohortIds, isLoading: cohortsLoading } =
    useActiveGroupCohorts(enabled);

  return useCohortDevicesQuery(cohortIds, params, enabled, cohortsLoading);
};

export const useActiveGroupCohortDevicesWithState = (
  params: CohortDevicesParams = {},
  enabled = true,
  activeGroupCohorts: ActiveGroupCohortsState
) => {
  return useCohortDevicesQuery(
    activeGroupCohorts.cohortIds,
    params,
    enabled,
    activeGroupCohorts.isLoading
  );
};

// Enhanced hook for managing active group cohorts with Redux store
export const useActiveGroupCohorts = (enabled = true) => {
  const dispatch = useDispatch();
  const activeGroup = useSelector(selectActiveGroup);
  const activeGroupCohorts = useSelector(selectActiveGroupCohorts);
  const error = useSelector(selectCohortsError);
  const lastFetchedGroupId = useSelector(selectLastFetchedGroupId);
  const previousGroupIdRef = useRef<string | null>(null);
  const latestGroupIdRef = useRef<string | null>(null);

  const groupId = activeGroup?.id;
  useEffect(() => {
    latestGroupIdRef.current = groupId ?? null;
  }, [groupId]);
  const hasStaleCohortsForGroup =
    !!groupId && !!lastFetchedGroupId && lastFetchedGroupId !== groupId;
  const shouldFetch =
    enabled && ((!!groupId && !lastFetchedGroupId) || hasStaleCohortsForGroup);
  const fetchGroupCohorts = useAbortableFetcher(
    useCallback(
      (signal: AbortSignal) => deviceService.getGroupCohorts(groupId!, signal),
      [groupId]
    )
  );

  useEffect(() => {
    const previousGroupId = previousGroupIdRef.current;
    previousGroupIdRef.current = groupId ?? null;

    if (!groupId) {
      if (activeGroupCohorts.length > 0 || lastFetchedGroupId) {
        dispatch(clearCohorts());
      }
      return;
    }

    if (previousGroupId && previousGroupId !== groupId) {
      dispatch(clearCohorts());
    }
  }, [groupId, activeGroupCohorts.length, lastFetchedGroupId, dispatch]);

  // Fetch cohorts for active group
  const { error: swrError, isLoading: swrIsLoading } =
    useSWR<GroupCohortsResponse>(
      shouldFetch ? ['group/cohorts', groupId] : null,
      fetchGroupCohorts,
      {
        ...SWR_STABLE_REQUEST_OPTIONS,
        dedupingInterval: 30000, // Cache for 30 seconds
        onSuccess: data => {
          if (!enabled || !groupId || latestGroupIdRef.current !== groupId) {
            return;
          }

          if (data?.success) {
            const normalizedCohortIds = normalizeCohortIds(data.data);

            dispatch(
              setActiveGroupCohorts({
                groupId,
                cohortIds: normalizedCohortIds,
              })
            );
            return;
          }

          dispatch(setCohortsError(data?.message || 'Failed to fetch cohorts'));
        },
        onError: err => {
          if (!enabled || latestGroupIdRef.current !== groupId) {
            return;
          }
          dispatch(setCohortsError(err.message || 'Failed to fetch cohorts'));
        },
      }
    );

  const resolvedCohortIds =
    enabled && groupId && lastFetchedGroupId === groupId
      ? activeGroupCohorts
      : [];
  const hasCohortError = Boolean(error || swrError);
  const hasPendingGroup =
    enabled && !!groupId && lastFetchedGroupId !== groupId;
  const resolvedError = enabled ? error || swrError : null;

  return {
    cohortIds: resolvedCohortIds,
    isLoading: enabled
      ? swrIsLoading || (hasPendingGroup && !hasCohortError)
      : false,
    error: resolvedError,
    refetch: () => {
      if (enabled && groupId) {
        // Force refetch by updating the key
        mutate(['group/cohorts', groupId]);
      }
    },
  };
};
