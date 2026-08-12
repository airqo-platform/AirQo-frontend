'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { deviceService } from '@/shared/services/deviceService';
import { useActiveGroupCohorts, useGroupCohorts } from '@/shared/hooks/useDevice';
import { normalizeCohortIds } from '@/shared/utils/cohortUtils';
import { normalizeSitesData } from '@/shared/utils/siteUtils';
import { normalizeDevicesData } from '@/shared/utils/deviceUtils';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { NormalizedSiteData, RawSiteData } from '@/shared/utils/siteUtils';
import type {
  NormalizedDeviceData,
  RawDeviceData,
} from '@/shared/utils/deviceUtils';
import type {
  CohortSitesParams,
  CohortSitesMeta,
  CohortDevicesParams,
  CohortDevicesMeta,
} from '@/shared/types/api';

const SWR_STABLE_REQUEST_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: false,
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

/**
 * Resolves the cohort IDs for the given group. When `groupId` is empty the
 * active group's cohorts are used; when set, the group's cohorts are fetched
 * directly so organization-flow pages don't depend on a group switch.
 */
const useResolvedCohortIds = (groupId: string, enabled: boolean) => {
  const {
    cohortIds: activeGroupCohortIds,
    isLoading: activeGroupCohortsLoading,
  } = useActiveGroupCohorts(enabled && !groupId);

  const { data: groupCohorts, isLoading: groupCohortsLoading } =
    useGroupCohorts(groupId, enabled && !!groupId);

  const cohortIds = useMemo(
    () =>
      groupId
        ? normalizeCohortIds(groupCohorts?.data ?? [])
        : activeGroupCohortIds,
    [groupId, groupCohorts?.data, activeGroupCohortIds]
  );

  const isLoading = groupId ? groupCohortsLoading : activeGroupCohortsLoading;

  return { cohortIds, isLoading };
};

interface CohortSelectionOptions {
  groupId?: string;
  enabled?: boolean;
  initialPageSize?: number;
  maxLimit?: number;
}

/**
 * Server-side paginated + searchable site list scoped to a group's cohorts
 * (via /devices/cohorts/cached-sites). Mirrors the shared useSitesData hook
 * but accepts an explicit group id for organization flows.
 */
export const useSitesForSelection = ({
  groupId = '',
  enabled = true,
  initialPageSize = 6,
  maxLimit = 80,
}: CohortSelectionOptions = {}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(Math.min(initialPageSize, maxLimit));
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { cohortIds, isLoading: cohortsLoading } = useResolvedCohortIds(
    groupId,
    enabled
  );

  const shouldFetch = enabled && cohortIds.length > 0 && !cohortsLoading;

  // Reset pagination when the dataset changes (e.g. a group switch while the
  // picker is open) so `skip` never overshoots the new cohort's pages.
  const cohortIdsKey = cohortIds.join(',');
  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortIdsKey]);

  const params = useMemo((): CohortSitesParams => {
    const effectivePageSize = Math.min(pageSize, maxLimit);
    const nextParams: CohortSitesParams = {
      limit: effectivePageSize,
      skip: (currentPage - 1) * effectivePageSize,
    };
    if (debouncedSearchTerm.trim()) {
      nextParams.search = debouncedSearchTerm.trim();
    }
    return nextParams;
  }, [currentPage, pageSize, debouncedSearchTerm, maxLimit]);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    []
  );

  const fetchSites = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      return await deviceService.getCohortSites(
        { cohort_ids: cohortIds },
        params,
        controller.signal
      );
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [cohortIds, params]);

  const key = shouldFetch
    ? ['selection/sites', groupId || 'active-group', cohortIds, params]
    : null;

  const { data, error, isLoading, isValidating, mutate: mutateData } = useSWR(
    key,
    fetchSites,
    {
      ...SWR_STABLE_REQUEST_OPTIONS,
      isPaused: () => cohortsLoading,
    }
  );

  const resolvedError = isAbortError(error) ? null : error;
  const hasData = typeof data !== 'undefined';

  // React StrictMode double-mount aborts the first in-flight request; SWR's
  // dedup window can then suppress the follow-up fetch, leaving the list
  // stuck empty. Re-trigger once when that happens.
  const recoveredAbortRef = useRef(false);
  useEffect(() => {
    if (error && isAbortError(error) && !recoveredAbortRef.current) {
      recoveredAbortRef.current = true;
      void mutateData();
    }
  }, [error, mutateData]);

  const sites = useMemo<NormalizedSiteData[]>(() => {
    if (!data?.sites || !Array.isArray(data.sites)) return [];
    return normalizeSitesData(data.sites as RawSiteData[]);
  }, [data?.sites]);

  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleSetPageSize = useCallback(
    (size: number) => {
      setPageSize(Math.min(size, maxLimit));
      setCurrentPage(1);
    },
    [maxLimit]
  );

  return {
    sites,
    totalSites: data?.meta?.total ?? 0,
    totalPages: data?.meta?.totalPages ?? 1,
    currentPage,
    pageSize: Math.min(pageSize, maxLimit),
    searchTerm,
    // True while data exists and a revalidation (search/page change) is in
    // flight — the picker table shows an in-place refreshing overlay instead
    // of swapping the whole table for a loading state.
    isRefreshing: hasData && isValidating,
    isLoading: !hasData && (isLoading || cohortsLoading),
    error: resolvedError ? (resolvedError.message ?? null) : null,
    setCurrentPage,
    setPageSize: handleSetPageSize,
    setSearchTerm: handleSetSearchTerm,
    retry: () => mutateData(),
    meta: data?.meta as CohortSitesMeta | undefined,
  };
};

/**
 * Server-side paginated + searchable device list scoped to a group's cohorts
 * (via /devices/cohorts/cached-devices).
 */
export const useDevicesForSelection = ({
  groupId = '',
  enabled = true,
  initialPageSize = 6,
  maxLimit = 80,
}: CohortSelectionOptions = {}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(Math.min(initialPageSize, maxLimit));
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { cohortIds, isLoading: cohortsLoading } = useResolvedCohortIds(
    groupId,
    enabled
  );

  const shouldFetch = enabled && cohortIds.length > 0 && !cohortsLoading;

  // Reset pagination when the dataset changes (e.g. a group switch while the
  // picker is open) so `skip` never overshoots the new cohort's pages.
  const cohortIdsKey = cohortIds.join(',');
  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortIdsKey]);

  const params = useMemo((): CohortDevicesParams => {
    const effectivePageSize = Math.min(pageSize, maxLimit);
    const nextParams: CohortDevicesParams = {
      limit: effectivePageSize,
      skip: (currentPage - 1) * effectivePageSize,
    };
    if (debouncedSearchTerm.trim()) {
      nextParams.search = debouncedSearchTerm.trim();
    }
    return nextParams;
  }, [currentPage, pageSize, debouncedSearchTerm, maxLimit]);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    []
  );

  const fetchDevices = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      return await deviceService.getCohortDevices(
        { cohort_ids: cohortIds },
        params,
        controller.signal
      );
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [cohortIds, params]);

  const key = shouldFetch
    ? ['selection/devices', groupId || 'active-group', cohortIds, params]
    : null;

  const { data, error, isLoading, isValidating, mutate: mutateData } = useSWR(
    key,
    fetchDevices,
    {
      ...SWR_STABLE_REQUEST_OPTIONS,
      isPaused: () => cohortsLoading,
    }
  );

  const resolvedError = isAbortError(error) ? null : error;
  const hasData = typeof data !== 'undefined';

  // StrictMode double-mount abort recovery (same as the sites hook)
  const recoveredAbortRef = useRef(false);
  useEffect(() => {
    if (error && isAbortError(error) && !recoveredAbortRef.current) {
      recoveredAbortRef.current = true;
      void mutateData();
    }
  }, [error, mutateData]);

  const devices = useMemo<NormalizedDeviceData[]>(() => {
    if (!data?.devices || !Array.isArray(data.devices)) return [];
    return normalizeDevicesData(data.devices as RawDeviceData[]);
  }, [data?.devices]);

  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleSetPageSize = useCallback(
    (size: number) => {
      setPageSize(Math.min(size, maxLimit));
      setCurrentPage(1);
    },
    [maxLimit]
  );

  return {
    devices,
    totalDevices: data?.meta?.total ?? 0,
    totalPages: data?.meta?.totalPages ?? 1,
    currentPage,
    pageSize: Math.min(pageSize, maxLimit),
    searchTerm,
    // True while data exists and a revalidation (search/page change) is in
    // flight — the picker table shows an in-place refreshing overlay instead
    // of swapping the whole table for a loading state.
    isRefreshing: hasData && isValidating,
    isLoading: !hasData && (isLoading || cohortsLoading),
    error: resolvedError ? (resolvedError.message ?? null) : null,
    setCurrentPage,
    setPageSize: handleSetPageSize,
    setSearchTerm: handleSetSearchTerm,
    retry: () => mutateData(),
    meta: data?.meta as CohortDevicesMeta | undefined,
  };
};
