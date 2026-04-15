'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { deviceService } from '../../../shared/services/deviceService';
import type {
  SitesSummaryResponse,
  SitesSummaryParams,
  CohortSitesResponse,
} from '../../../shared/types/api';
import { formatCountryForApi } from '../utils/dataNormalization';

export interface UseSitesByCountryParams {
  country?: string;
  enabled?: boolean;
  initialLimit?: number;
  cohort_id?: string;
}

export interface UseSitesByCountryResult {
  sites: Record<string, unknown>[];
  totalSites: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasNextPage: boolean;
  loadMore: () => void;
  refetch: () => Promise<void>;
  setCountry: (country: string | undefined) => void;
}

/**
 * Hook for fetching sites by country with pagination support
 * Country is determined dynamically from the countries list
 */
export function useSitesByCountry({
  country,
  enabled = true,
  initialLimit = 6,
  cohort_id,
}: UseSitesByCountryParams = {}): UseSitesByCountryResult {
  const [currentCountry, setCurrentCountry] = useState<string | undefined>(
    country
  );

  useEffect(() => {
    setCurrentCountry(country);
  }, [country]);

  const queryResult = useInfiniteQuery<
    SitesSummaryResponse | CohortSitesResponse,
    Error
  >({
    queryKey: [
      'map',
      'sites-by-country',
      currentCountry ?? 'all',
      cohort_id ?? 'no-cohort',
      initialLimit,
    ],
    enabled,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const queryParams: SitesSummaryParams = {
        limit: initialLimit,
        skip: Number(pageParam) * initialLimit,
      };

      if (currentCountry) {
        queryParams.country = formatCountryForApi(currentCountry);
      }

      if (cohort_id) {
        const cohortIds = cohort_id.split(',').filter(Boolean);
        return deviceService.getCohortSites(
          { cohort_ids: cohortIds },
          {
            ...queryParams,
            search: queryParams.search,
          }
        );
      }

      // NOTE: Do NOT infer authentication flow from `cohort_id`.
      // `cohort_id` is a filter and should not determine whether the
      // authenticated or token-based client is used. Overloading `cohort_id`
      // to select the auth flow prevents making an unfiltered authenticated
      // request; prefer an explicit `isOrgFlow` flag to pick the appropriate
      // client (e.g., `getSitesSummaryAuthenticated` vs `getSitesSummaryWithToken`).
      return deviceService.getSitesSummaryWithToken(queryParams);
    },
    getNextPageParam: lastPage => {
      const { page, totalPages } = lastPage.meta;
      if (page < totalPages) {
        return page;
      }
      return undefined;
    },
    networkMode: 'online',
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 12,
  });

  const {
    data,
    isLoading,
    isFetchingNextPage,
    error,
    hasNextPage,
    fetchNextPage,
    refetch: refetchQuery,
  } = queryResult;

  const sites = useMemo(
    () => data?.pages.flatMap(page => page.sites) ?? [],
    [data?.pages]
  );

  const latestMeta = useMemo(() => {
    const pages = data?.pages;
    if (!pages || pages.length === 0) return null;
    return pages[pages.length - 1].meta;
  }, [data?.pages]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const refetch = useCallback(async () => {
    await refetchQuery();
  }, [refetchQuery]);

  const setCountry = useCallback((newCountry: string | undefined) => {
    setCurrentCountry(newCountry);
  }, []);

  const noopLoadMore = useCallback(() => undefined, []);
  const noopRefetch = useCallback(async () => undefined, []);
  const noopSetCountry: UseSitesByCountryResult['setCountry'] = useCallback(
    () => undefined,
    []
  );

  if (!enabled) {
    return {
      sites: [],
      totalSites: 0,
      totalPages: 0,
      currentPage: 1,
      isLoading: false,
      isLoadingMore: false,
      error: null,
      hasNextPage: false,
      loadMore: noopLoadMore,
      refetch: noopRefetch,
      setCountry: noopSetCountry,
    };
  }

  return {
    sites,
    totalSites: latestMeta?.total ?? 0,
    totalPages: latestMeta?.totalPages ?? 0,
    currentPage: latestMeta?.page ?? 1,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    error: error?.message ?? null,
    hasNextPage: Boolean(hasNextPage),
    loadMore,
    refetch,
    setCountry,
  };
}
