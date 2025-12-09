import useSWR, { mutate } from 'swr';
import { useEffect } from 'react';
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
} from '../types/api';

// Authenticated sites summary hook
export const useSitesSummary = (
  params: SitesSummaryParams = {},
  enabled = true
) => {
  const key = enabled ? ['sites/summary', params] : null;

  return useSWR<SitesSummaryResponse>(
    key,
    () => deviceService.getSitesSummaryAuthenticated(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
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
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
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
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
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
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
};

// Cohort sites hook
export const useCohortSites = (
  cohortIds: string[],
  params: CohortSitesParams = {},
  enabled = true
) => {
  const key =
    enabled && cohortIds.length > 0
      ? ['cohort/sites', cohortIds, params]
      : null;

  return useSWR<CohortSitesResponse>(
    key,
    () => deviceService.getCohortSites({ cohort_ids: cohortIds }, params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
};

// Enhanced cohort sites hook with automatic active group cohorts
export const useActiveGroupCohortSites = (
  params: CohortSitesParams = {},
  enabled = true
) => {
  const { cohortIds, isLoading: cohortsLoading } = useActiveGroupCohorts();

  const shouldFetch = enabled && cohortIds.length > 0 && !cohortsLoading;

  const key = shouldFetch
    ? ['cohort/sites/active-group', cohortIds, params]
    : null;

  const result = useSWR<CohortSitesResponse>(
    key,
    () => deviceService.getCohortSites({ cohort_ids: cohortIds }, params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      // Don't fetch if cohorts are still loading
      isPaused: () => cohortsLoading,
    }
  );

  return {
    ...result,
    isLoading: result.isLoading || cohortsLoading,
    cohortIds, // Expose the cohort IDs being used
  };
};

// Enhanced cohort devices hook with automatic active group cohorts
export const useActiveGroupCohortDevices = (
  params: CohortDevicesParams = {},
  enabled = true
) => {
  const { cohortIds, isLoading: cohortsLoading } = useActiveGroupCohorts();

  const shouldFetch = enabled && cohortIds.length > 0 && !cohortsLoading;

  const key = shouldFetch
    ? ['cohort/devices/active-group', cohortIds, params]
    : null;

  const result = useSWR<CohortDevicesResponse>(
    key,
    () => deviceService.getCohortDevices({ cohort_ids: cohortIds }, params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      // Don't fetch if cohorts are still loading
      isPaused: () => cohortsLoading,
    }
  );

  return {
    ...result,
    isLoading: result.isLoading || cohortsLoading,
    cohortIds, // Expose the cohort IDs being used
  };
};

// Cohort devices hook
export const useCohortDevices = (
  cohortIds: string[],
  params: CohortDevicesParams = {},
  enabled = true
) => {
  const key =
    enabled && cohortIds.length > 0
      ? ['cohort/devices', cohortIds, params]
      : null;

  return useSWR<CohortDevicesResponse>(
    key,
    () => deviceService.getCohortDevices({ cohort_ids: cohortIds }, params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
};

// Group cohorts hook
export const useGroupCohorts = (groupId: string, enabled = true) => {
  const key = enabled && groupId ? ['group/cohorts', groupId] : null;

  return useSWR<GroupCohortsResponse>(
    key,
    () => deviceService.getGroupCohorts(groupId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
};

// Enhanced hook for managing active group cohorts with Redux store
export const useActiveGroupCohorts = () => {
  const dispatch = useDispatch();
  const activeGroup = useSelector(selectActiveGroup);
  const activeGroupCohorts = useSelector(selectActiveGroupCohorts);
  const isLoading = useSelector(selectCohortsLoading);
  const error = useSelector(selectCohortsError);
  const lastFetchedGroupId = useSelector(selectLastFetchedGroupId);

  const groupId = activeGroup?.id;
  const shouldFetch =
    groupId && (!lastFetchedGroupId || lastFetchedGroupId !== groupId);

  // Fetch cohorts for active group
  const { error: swrError } = useSWR<GroupCohortsResponse>(
    shouldFetch ? ['group/cohorts', groupId] : null,
    () => deviceService.getGroupCohorts(groupId!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
      onLoadingSlow: () => {
        dispatch(setCohortsLoading(true));
      },
      onSuccess: data => {
        if (data?.success && groupId) {
          dispatch(
            setActiveGroupCohorts({
              groupId,
              cohortIds: data.data || [],
            })
          );
        }
      },
      onError: err => {
        dispatch(setCohortsError(err.message || 'Failed to fetch cohorts'));
      },
    }
  );

  // Clear cohorts when group changes or is cleared
  useEffect(() => {
    if (!groupId) {
      dispatch(clearCohorts());
    }
  }, [groupId, dispatch]);

  return {
    cohortIds: activeGroupCohorts,
    isLoading,
    error: error || swrError,
    refetch: () => {
      if (groupId) {
        // Force refetch by updating the key
        mutate(['group/cohorts', groupId]);
      }
    },
  };
};
