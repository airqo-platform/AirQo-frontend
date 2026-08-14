import useSWR, { mutate } from 'swr';
import { useEffect, useRef, useCallback, useMemo } from 'react';
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
  revalidateOnReconnect: true,
  shouldRetryOnError: false,
  // The auth tree mounts more than once per page load; a remount must reuse
  // the cached response instead of re-firing the request. Freshness is
  // handled by key changes (group switch), explicit mutations and the
  // group-switch invalidation.
  revalidateIfStale: false,
  dedupingInterval: 5000,
} as const;

const isAbortError = (error: unknown): boolean => {
  const candidate = error as {
    name?: string;
    code?: string;
    message?: string;
  } | null;
  if (!candidate) return false;
  return (
    candidate.name === 'AbortError' ||
    candidate.name === 'CanceledError' ||
    candidate.code === 'ERR_CANCELED' ||
    candidate.message === 'canceled'
  );
};

const useAbortableFetcher = <T>(
  fetcher: (signal: AbortSignal) => Promise<T>
) => {
  const abortRef = useRef<AbortController | null>(null);

  // NOTE: no abort on unmount. SWR deduplicates subscribers on the same key
  // and shares one in-flight request between them — a StrictMode remount
  // subscribes to the SAME in-flight request, and aborting it on unmount
  // leaves the remount with a "canceled" error that nothing re-triggers
  // (shouldRetryOnError: false). The request is still aborted when a NEW
  // fetch supersedes it (revalidation / key change), and the AbortSignal
  // keeps working for per-request cancellation.

  return useCallback(async () => {
    // Abort the previous in-flight request when a new fetch supersedes it.
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
  const cohortsLoadingRef = useRef(cohortsLoading);
  cohortsLoadingRef.current = cohortsLoading;

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
    isPaused: () => cohortsLoadingRef.current,
  });
  const resolvedError = isAbortError(result.error) ? null : result.error;
  const hasData = typeof result.data !== 'undefined';

  return {
    ...result,
    error: resolvedError,
    isLoading: !hasData && (result.isLoading || cohortsLoading),
    cohortIds,
  };
};

const useCohortDevicesQuery = (
  cohortIds: string[],
  params: CohortDevicesParams = {},
  enabled = true,
  cohortsLoading = false
) => {
  const cohortsLoadingRef = useRef(cohortsLoading);
  cohortsLoadingRef.current = cohortsLoading;

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
    isPaused: () => cohortsLoadingRef.current,
  });
  const resolvedError = isAbortError(result.error) ? null : result.error;
  const hasData = typeof result.data !== 'undefined';

  return {
    ...result,
    error: resolvedError,
    isLoading: !hasData && (result.isLoading || cohortsLoading),
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
  // Memoized so the key's identity is stable across renders — a fresh array
  // would make the abort-recovery effect below re-run on every render.
  const key = useMemo(
    () => (enabled && groupId ? ['group/cohorts', groupId] : null),
    [enabled, groupId]
  );
  const fetcher = useAbortableFetcher(
    useCallback(
      (signal: AbortSignal) => deviceService.getGroupCohorts(groupId, signal),
      [groupId]
    )
  );

  const result = useSWR<GroupCohortsResponse>(
    key,
    fetcher,
    SWR_STABLE_REQUEST_OPTIONS
  );

  // A canceled error can land on the key (e.g. a superseded fetch); nothing
  // re-fires it (shouldRetryOnError: false), so re-trigger once when that
  // happens — otherwise cohortIds stay empty and dependent lists hang.
  const recoveredAbortRef = useRef(false);
  useEffect(() => {
    if (
      key &&
      result.error &&
      isAbortError(result.error) &&
      !recoveredAbortRef.current
    ) {
      recoveredAbortRef.current = true;
      mutate(key);
    }
  }, [key, result.error]);

  return result;
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

  const result = useSWR<CohortResponse>(key, fetcher, {
    ...SWR_STABLE_REQUEST_OPTIONS,
  });

  return {
    ...result,
    error: isAbortError(result.error) ? null : result.error,
  };
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
      dispatch(clearCohorts());
      return;
    }

    if (previousGroupId && previousGroupId !== groupId) {
      dispatch(clearCohorts());
    }
    // Intentionally omit activeGroupCohorts.length and lastFetchedGroupId from
    // deps: those Redux updates must not re-run this effect or it would clear
    // cohorts immediately after they are populated by onSuccess.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, dispatch]);

  // Fetch cohorts for active group
  const { data, error: swrError, isLoading: swrIsLoading } =
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

  // With revalidateIfStale: false a remount serves the cached response
  // WITHOUT firing a fetch, so onSuccess never runs and the Redux store
  // would stay empty (lastFetchedGroupId unset → resolvedCohortIds []).
  // Hydrate Redux from the cached response instead of issuing a duplicate
  // request. Idempotent: once lastFetchedGroupId matches, shouldFetch flips
  // false and this effect stops running.
  useEffect(() => {
    if (
      enabled &&
      groupId &&
      lastFetchedGroupId !== groupId &&
      data?.success &&
      !swrIsLoading
    ) {
      dispatch(
        setActiveGroupCohorts({
          groupId,
          cohortIds: normalizeCohortIds(data.data),
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, groupId, data, swrIsLoading, dispatch, lastFetchedGroupId]);

  const resolvedCohortIds =
    enabled && groupId && lastFetchedGroupId === groupId
      ? activeGroupCohorts
      : [];
  const hasCohortError = Boolean(error || swrError);
  const hasPendingGroup =
    enabled && !!groupId && lastFetchedGroupId !== groupId;
  const resolvedError = enabled ? error || swrError : null;

  // A canceled error can land on the key while lastFetchedGroupId is still
  // unset (e.g. StrictMode remount or a superseded fetch); nothing re-fires
  // it (shouldRetryOnError: false), leaving cohortIds permanently empty and
  // the sites table stuck on "Loading data...". Re-trigger once.
  const recoveredAbortRef = useRef(false);
  useEffect(() => {
    if (
      shouldFetch &&
      swrError &&
      isAbortError(swrError) &&
      !recoveredAbortRef.current
    ) {
      recoveredAbortRef.current = true;
      mutate(['group/cohorts', groupId]);
    }
  }, [shouldFetch, swrError, groupId]);

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
