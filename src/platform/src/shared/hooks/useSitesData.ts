import { useState, useMemo, useCallback } from 'react';
import { useActiveGroupCohortSites } from '../hooks/useDevice';
import { normalizeSitesData } from '../utils/siteUtils';
import { useDebounce } from './useDebounce';
import type { NormalizedSiteData, RawSiteData } from '../utils/siteUtils';
import type { CohortSitesParams, CohortSitesMeta } from '../types/api';

export interface UseSitesDataParams {
  enabled?: boolean;
  initialPageSize?: number;
  maxLimit?: number;
}

export interface UseSitesDataResult {
  // Data
  sites: NormalizedSiteData[];
  totalSites: number;
  totalPages: number;
  currentPage: number;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Pagination controls
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  pageSize: number;

  // Search controls
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // Raw metadata
  meta?: CohortSitesMeta;
}

/**
 * Enhanced hook for fetching and managing sites data with server-side pagination and search
 * Implements proper server-side operations with max limit of 80 per API constraints
 */
export function useSitesData({
  enabled = true,
  initialPageSize = 6,
  maxLimit = 80,
}: UseSitesDataParams = {}): UseSitesDataResult {
  // State for pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(Math.min(initialPageSize, maxLimit));
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Build API parameters with proper server-side pagination
  const apiParams = useMemo((): CohortSitesParams => {
    const effectivePageSize = Math.min(pageSize, maxLimit);
    const params: CohortSitesParams = {
      limit: effectivePageSize,
      skip: (currentPage - 1) * effectivePageSize,
    };

    // Add search parameter if provided
    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    return params;
  }, [currentPage, pageSize, debouncedSearchTerm, maxLimit]);

  // Fetch data using the enhanced hook
  const { data, error, isLoading } = useActiveGroupCohortSites(
    enabled ? apiParams : undefined
  );

  // Normalize sites data
  const normalizedSites = useMemo(() => {
    if (!data?.sites || !Array.isArray(data.sites)) {
      return [];
    }
    return normalizeSitesData(data.sites as RawSiteData[]);
  }, [data?.sites]);

  // Handlers for pagination and search
  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const handleSetPageSize = useCallback(
    (size: number) => {
      const effectiveSize = Math.min(size, maxLimit);
      setPageSize(effectiveSize);
      setCurrentPage(1); // Reset to first page when page size changes
    },
    [maxLimit]
  );

  return {
    // Data
    sites: normalizedSites,
    totalSites: data?.meta?.total ?? 0,
    totalPages: data?.meta?.totalPages ?? 1,
    currentPage,

    // Loading states
    isLoading,
    error: typeof error === 'string' ? error : (error?.message ?? null),

    // Pagination controls
    setCurrentPage,
    setPageSize: handleSetPageSize,
    pageSize: Math.min(pageSize, maxLimit),

    // Search controls
    searchTerm,
    setSearchTerm: handleSetSearchTerm,

    // Raw metadata
    meta: data?.meta,
  };
}
