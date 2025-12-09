'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [sites, setSites] = useState<Record<string, unknown>[]>([]);
  const [totalSites, setTotalSites] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCountry, setCurrentCountry] = useState<string | undefined>(
    country
  );

  // Ref to track previous country for change detection
  const prevCountryRef = useRef<string | undefined>(country);

  const fetchSites = useCallback(
    async (
      params: SitesSummaryParams = {},
      append = false,
      isLoadMore = false
    ) => {
      if (!enabled) return;

      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const queryParams: SitesSummaryParams = {
          limit: initialLimit,
          ...params,
        };

        if (currentCountry) {
          queryParams.country = formatCountryForApi(currentCountry);
        }

        let response: SitesSummaryResponse | CohortSitesResponse;

        if (cohort_id) {
          const cohortIds = cohort_id.split(',');
          response = await deviceService.getCohortSites(
            { cohort_ids: cohortIds },
            {
              ...queryParams,
              search: queryParams.search,
            }
          );
        } else {
          response =
            await deviceService.getSitesSummaryAuthenticated(queryParams);
        }

        if (append) {
          setSites(prev => [...prev, ...response.sites]);
        } else {
          setSites(response.sites);
        }

        setTotalSites(response.meta.total);
        setTotalPages(response.meta.totalPages);
        setCurrentPage(response.meta.page);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sites');
      } finally {
        if (isLoadMore) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [enabled, initialLimit, currentCountry, cohort_id]
  );

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || currentPage >= totalPages) return;

    const nextSkip = currentPage * initialLimit;
    fetchSites({ skip: nextSkip }, true, true);
  }, [
    isLoading,
    isLoadingMore,
    currentPage,
    totalPages,
    initialLimit,
    fetchSites,
  ]);

  const refetch = useCallback(async () => {
    setSites([]);
    setCurrentPage(1);
    await fetchSites({}, false);
  }, [fetchSites]);

  const setCountry = useCallback((newCountry: string | undefined) => {
    setCurrentCountry(newCountry);
    setSites([]);
    setCurrentPage(1);
    setTotalSites(0);
    setTotalPages(0);
    setIsLoading(true); // Set loading state when country changes
  }, []);

  // Detect country prop changes and reset state
  useEffect(() => {
    if (prevCountryRef.current !== country) {
      prevCountryRef.current = country;
      setCountry(country);
    }
  }, [country, setCountry]);

  useEffect(() => {
    fetchSites({}, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCountry, enabled, cohort_id]);

  return {
    sites,
    totalSites,
    totalPages,
    currentPage,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage: currentPage < totalPages,
    loadMore,
    refetch,
    setCountry,
  };
}
