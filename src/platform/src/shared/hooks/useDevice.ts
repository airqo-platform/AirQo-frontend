import useSWR, { mutate } from 'swr';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deviceService } from '../services/deviceService';
import {
  setCohortsLoading,
  setCohortsError,
  setActiveGroupCohorts,
  clearCohorts,
} from '../store/cohortSlice';
import {
  selectActiveGroupCohorts,
  selectCohortsLoading,
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

const SWR_STABLE_REQUEST_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
  dedupingInterval: 5000,
} as const;

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

  const result = useSWR<CohortSitesResponse>(
    key,
    () => deviceService.getCohortSites({ cohort_ids: cohortIds }, params),
    {
      ...SWR_STABLE_REQUEST_OPTIONS,
      isPaused: () => cohortsLoading,
    }
  );

  return {
    ...result,
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

  const result = useSWR<CohortDevicesResponse>(
    key,
    () => deviceService.getCohortDevices({ cohort_ids: cohortIds }, params),
    {
      ...SWR_STABLE_REQUEST_OPTIONS,
      isPaused: () => cohortsLoading,
    }
  );

  return {
    ...result,
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

  return useSWR<SitesSummaryResponse>(
    key,
    () => deviceService.getSitesSummaryAuthenticated(params),
    SWR_STABLE_REQUEST_OPTIONS
  );
};

// Token-based sites summary hook
export const useSitesSummaryWithToken = (
  params: SitesSummaryParams = {},
  enabled = true
) => {
  const key = enabled ? ['sites/summary/token', params] : null;

  return useSWR<SitesSummaryResponse>(
    key,
    () => deviceService.getSitesSummaryWithToken(params),
    SWR_STABLE_REQUEST_OPTIONS
  );
};

// Authenticated grids summary hook
export const useGridsSummary = (
  params: GridsSummaryParams = {},
  cohort_id?: string,
  enabled = true
) => {
  const key = enabled ? ['grids/summary', params, cohort_id] : null;

  return useSWR<GridsSummaryResponse>(
    key,
    () => deviceService.getGridsSummaryAuthenticated(params, cohort_id),
    SWR_STABLE_REQUEST_OPTIONS
  );
};

// Token-based grids summary hook
export const useGridsSummaryWithToken = (
  params: GridsSummaryParams = {},
  cohort_id?: string,
  enabled = true
) => {
  const key = enabled ? ['grids/summary/token', params, cohort_id] : null;

  return useSWR<GridsSummaryResponse>(
    key,
    () => deviceService.getGridsSummaryWithToken(params, cohort_id),
    SWR_STABLE_REQUEST_OPTIONS
  );
};

// Cohort sites hook
export const useCohortSites = (
  cohortIds: string[],
  params: CohortSitesParams = {},
  enabled = true
) => {
  return useSWR<CohortSitesResponse>(
    enabled && cohortIds.length > 0
      ? ['cohort/sites', cohortIds, params]
      : null,
    () => deviceService.getCohortSites({ cohort_ids: cohortIds }, params),
    SWR_STABLE_REQUEST_OPTIONS
  );
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
  return useSWR<CohortDevicesResponse>(
    enabled && cohortIds.length > 0
      ? ['cohort/devices', cohortIds, params]
      : null,
    () => deviceService.getCohortDevices({ cohort_ids: cohortIds }, params),
    SWR_STABLE_REQUEST_OPTIONS
  );
};

// Group cohorts hook
export const useGroupCohorts = (groupId: string, enabled = true) => {
  const key = enabled && groupId ? ['group/cohorts', groupId] : null;

  return useSWR<GroupCohortsResponse>(
    key,
    () => deviceService.getGroupCohorts(groupId),
    SWR_STABLE_REQUEST_OPTIONS
  );
};

// Cohort details hook
export const useCohort = (cohortId: string, enabled = true) => {
  const key = enabled && cohortId ? ['cohort/details', cohortId] : null;

  return useSWR<CohortResponse>(key, () => deviceService.getCohort(cohortId), {
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
  const isLoading = useSelector(selectCohortsLoading);
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
      () => deviceService.getGroupCohorts(groupId!),
      {
        ...SWR_STABLE_REQUEST_OPTIONS,
        dedupingInterval: 30000, // Cache for 30 seconds
        onLoadingSlow: () => {
          if (!enabled || latestGroupIdRef.current !== groupId) {
            return;
          }
          dispatch(setCohortsLoading(true));
        },
        onSuccess: data => {
          if (!enabled || !groupId || latestGroupIdRef.current !== groupId) {
            return;
          }

          if (data?.success) {
            const normalizedCohortIds = Array.from(
              new Set(
                (Array.isArray(data.data) ? data.data : [])
                  .map(cohortId => cohortId?.trim())
                  .filter((cohortId): cohortId is string => Boolean(cohortId))
              )
            );

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
      ? isLoading ||
        (Boolean(groupId) && swrIsLoading) ||
        (hasPendingGroup && !hasCohortError)
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
