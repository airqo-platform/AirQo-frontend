'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { useSelector } from 'react-redux';
import { deviceService } from '@/shared/services/deviceService';
import {
  useActiveGroupCohorts,
  useGroupCohorts,
} from '@/shared/hooks/useDevice';
import { selectActiveGroup } from '@/shared/store/selectors';
import { normalizeCohortIds } from '@/shared/utils/cohortUtils';
import { normalizeSitesData } from '@/shared/utils/siteUtils';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { NormalizedSiteData, RawSiteData } from '@/shared/utils/siteUtils';
import type { CohortSitesParams, CohortSitesMeta } from '@/shared/types/api';

const SWR_STABLE_REQUEST_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: false,
  // Bounded dedupe window: concurrent consumers of the same key (explore
  // table, location picker) share one in-flight request.
  dedupingInterval: 10000,
  // Serve cached rows for 10 minutes instead of refetching on every remount
  // (e.g. navigating explore → site detail → back). The table's manual
  // refresh button revalidates on demand.
  staleTime: 10 * 60 * 1000,
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
 * Resolves the cohort IDs for the given group.
 *
 * - `groupId` empty → the active group's cohorts (Redux, fetched by
 *   UserDataFetcher — one request, shared app-wide).
 * - `groupId` === the active group → reuses those same Redux cohorts instead
 *   of issuing a second `GET /users/groups/:id/cohorts` for the same group
 *   (the previous implementation fetched the same endpoint twice per load).
 * - any other group (organization flow) → fetched directly.
 *
 * Falls back to a direct fetch when the Redux path resolved empty (failed
 * fetch), so the table never gets stuck on a missing cohort list.
 */
const useResolvedCohortIds = (groupId: string, enabled: boolean) => {
  const activeGroup = useSelector(selectActiveGroup);
  const isActiveGroupRequest =
    enabled && !!groupId && !!activeGroup?.id && groupId === activeGroup.id;

  const {
    cohortIds: activeGroupCohortIds,
    isLoading: activeGroupCohortsLoading,
  } = useActiveGroupCohorts(enabled && (!groupId || isActiveGroupRequest));

  const activeGroupCohortsUnavailable =
    isActiveGroupRequest &&
    !activeGroupCohortsLoading &&
    activeGroupCohortIds.length === 0;

  const { data: groupCohorts, isLoading: groupCohortsLoading } =
    useGroupCohorts(
      groupId,
      enabled &&
        !!groupId &&
        (!isActiveGroupRequest || activeGroupCohortsUnavailable)
    );

  const cohortIds = useMemo(
    () =>
      isActiveGroupRequest && !activeGroupCohortsUnavailable
        ? activeGroupCohortIds
        : groupId
          ? normalizeCohortIds(groupCohorts?.data ?? [])
          : activeGroupCohortIds,
    [
      isActiveGroupRequest,
      activeGroupCohortsUnavailable,
      groupId,
      groupCohorts?.data,
      activeGroupCohortIds,
    ]
  );

  const isLoading =
    isActiveGroupRequest && !activeGroupCohortsUnavailable
      ? activeGroupCohortsLoading
      : groupId
        ? groupCohortsLoading
        : activeGroupCohortsLoading;

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

  const fetchSites = useCallback(async () => {
    // Abort this instance's previous in-flight request when a new fetch
    // supersedes it (search/page change, revalidation). No abort on unmount:
    // SWR shares one in-flight request between deduped subscribers (e.g.
    // StrictMode remount) and aborting it strands the remount on a canceled
    // error — the recovery effect below re-fires the fetch instead.
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

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: mutateData,
  } = useSWR(key, fetchSites, SWR_STABLE_REQUEST_OPTIONS);

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
