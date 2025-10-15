import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { SWR_CONFIG } from '../swrConfigs';
import logger from '@/lib/logger';

/**
 * Generic hook for handling paginated API endpoints with SWR
 * Optimized for performance and memory management
 *
 * @param {string} baseKey - Base key for SWR caching
 * @param {Function} fetcher - Function that fetches data with pagination params
 * @param {Object} options - Configuration options
 * @param {number} options.initialLimit - Initial page size (default: 20)
 * @param {number} options.maxLimit - Maximum page size (default: 100)
 * @param {Object} options.swrOptions - Additional SWR options
 * @param {boolean} options.enableInfiniteScroll - Enable infinite scroll behavior
 * @param {Object} options.baseParams - Base parameters to include in all requests
 * @param {string} options.search - Search query parameter
 * @returns {Object} Pagination state and methods
 */
export const usePaginatedData = (
  baseKey,
  fetcher,
  {
    initialLimit = 20,
    maxLimit = 100,
    swrOptions = {},
    enableInfiniteScroll = false,
    baseParams = {},
    search = '',
  } = {},
) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [allData, setAllData] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Refs to prevent memory leaks and stale closures
  const abortController = useRef(null);

  // Calculate skip value
  const skip = useMemo(() => (currentPage - 1) * limit, [currentPage, limit]);

  // Create SWR key with pagination params
  const swrKey = useMemo(() => {
    if (!baseKey) return null;

    return [
      baseKey,
      {
        ...baseParams,
        skip,
        limit,
        page: currentPage,
        ...(search ? { search } : {}),
      },
    ];
  }, [baseKey, baseParams, skip, limit, currentPage, search]);

  // SWR fetcher with abort controller
  const paginatedFetcher = useCallback(
    async ([, params]) => {
      // Cancel previous request if still pending
      if (abortController.current) {
        abortController.current.abort();
      }

      abortController.current = new AbortController();

      try {
        const result = await fetcher(params, abortController.current.signal);
        return result;
      } catch (error) {
        if (
          error.name === 'AbortError' ||
          error.name === 'CanceledError' ||
          error.code === 'ERR_CANCELED' ||
          error.code === 'ECONNABORTED'
        ) {
          logger.debug?.('Request aborted');
          return undefined; // do not update SWR cache on abort
        }
        throw error;
      }
    },
    [fetcher],
  );

  // Main SWR hook
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    paginatedFetcher,
    {
      ...SWR_CONFIG,
      ...swrOptions,
    },
  );

  // Extract pagination metadata and current page data
  const meta = data?.meta || {};
  const currentPageData = useMemo(() => {
    // Handle different response formats
    if (data?.devices) return data.devices;
    if (data?.sites) return data.sites;
    if (data?.grids) return data.grids;
    if (Array.isArray(data)) return data;

    // Additional safety check for empty/undefined data
    return [];
  }, [data]);

  // Update allData for infinite scroll
  const handleDataUpdate = useCallback(() => {
    setAllData((prevAll) => {
      // For first page or reset, replace all data
      if (currentPage === 1 || prevAll.length === 0) {
        return [...(currentPageData || [])];
      }

      // For infinite scroll: append new data (avoiding duplicates)
      if (enableInfiniteScroll) {
        if (!currentPageData || currentPageData.length === 0) {
          return prevAll; // Keep existing data if no new data
        }

        const existingIds = new Set(prevAll.map((item) => item._id || item.id));
        const newItems = currentPageData.filter(
          (item) => !existingIds.has(item._id || item.id),
        );

        return [...prevAll, ...newItems];
      } else {
        // For regular pagination: just return current page data
        return [...(currentPageData || [])];
      }
    });
  }, [enableInfiniteScroll, currentPageData, currentPage]);

  // Effect to update combined data when new data arrives
  useEffect(() => {
    handleDataUpdate();
  }, [currentPageData, handleDataUpdate]);

  // Navigation methods
  const goToPage = useCallback(
    (page) => {
      if (page < 1 || (meta.totalPages && page > meta.totalPages)) return;
      setCurrentPage(page);
    },
    [meta.totalPages],
  );

  const nextPage = useCallback(() => {
    if (!meta.totalPages || currentPage < meta.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, meta.totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    if (meta.totalPages) {
      setCurrentPage(meta.totalPages);
    }
  }, [meta.totalPages]);

  // Load more data method for infinite scroll
  const loadMore = useCallback(async () => {
    const hasMore = Boolean(
      meta.nextPage || (meta.totalPages && currentPage < meta.totalPages),
    );
    if (isLoadingMore || isLoading || !hasMore) return;

    setIsLoadingMore(true);
    try {
      // Go to next page which will automatically fetch and append data
      nextPage();
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    isLoading,
    meta.nextPage,
    meta.totalPages,
    currentPage,
    nextPage,
  ]);

  // Update page size
  const updateLimit = useCallback(
    (newLimit) => {
      const clampedLimit = Math.min(Math.max(newLimit, 1), maxLimit);
      setLimit(clampedLimit);
      setCurrentPage(1); // Reset to first page when changing limit
      if (enableInfiniteScroll) {
        setAllData([]); // Clear accumulated data
      }
    },
    [maxLimit, enableInfiniteScroll],
  );

  // Refresh current data
  const refresh = useCallback(() => {
    if (enableInfiniteScroll) {
      setAllData([]);
      setCurrentPage(1);
    }
    setIsLoadingMore(false);
    return mutate();
  }, [mutate, enableInfiniteScroll]);

  // Reset pagination state
  const reset = useCallback(() => {
    setCurrentPage(1);
    setLimit(initialLimit);
    setAllData([]);
    setIsLoadingMore(false);
  }, [initialLimit]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
    setIsLoadingMore(false);
    // Don't clear allData here - let the new API response populate it
  }, [search]);

  // Computed values
  const hasNextPage = useMemo(
    () =>
      Boolean(
        meta.nextPage || (meta.totalPages && currentPage < meta.totalPages),
      ),
    [meta.nextPage, meta.totalPages, currentPage],
  );

  const hasPrevPage = useMemo(
    () => Boolean(meta.previousPage || currentPage > 1),
    [meta.previousPage, currentPage],
  );

  const canLoadMore = useMemo(
    () => enableInfiniteScroll && hasNextPage && !isLoadingMore && !isLoading,
    [enableInfiniteScroll, hasNextPage, isLoadingMore, isLoading],
  );

  return {
    // Data
    data: enableInfiniteScroll ? allData : currentPageData,
    currentPageData,
    allData: enableInfiniteScroll ? allData : currentPageData,

    // Metadata
    meta,
    total: meta.total || 0,
    totalPages: meta.totalPages || 0,
    currentPage,
    limit,
    skip,

    // Loading states
    isLoading,
    isValidating,
    isLoadingMore,
    isError: !!error,
    error,

    // Pagination info
    hasNextPage,
    hasPrevPage,
    canLoadMore,

    // Navigation methods
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    loadMore,

    // Configuration methods
    updateLimit,
    refresh,
    reset,

    // Advanced features
    enableInfiniteScroll,
  };
};

/**
 * Specialized hook for sites summary with pagination
 */
export const usePaginatedSitesSummary = (group, options = {}) => {
  const { search = '', ...restOptions } = options;
  const normalizedGroup =
    typeof group === 'string' && group.trim().length > 0 ? group.trim() : '';

    const fetcher = useCallback(
      async (params, signal) => {
        // If a group is provided, fetch sites for that group's cohorts
        if (normalizedGroup) {
          const { getGroupCohortsApi } = await import('../apis/Account');
          const { getSitesForCohortsApi } = await import(
            '../apis/DeviceRegistry'
          );
    
          // Step 1: Fetch cohorts for the group
          const cohortsResponse = await getGroupCohortsApi(
            normalizedGroup,
            signal,
          );
          const cohortIds = cohortsResponse?.data || [];
    
          if (cohortIds.length === 0) {
            return { sites: [], meta: {} };
          }
    
          // Step 2: Fetch sites for the retrieved cohorts
          return getSitesForCohortsApi({
            cohort_ids: cohortIds,
            ...params,
            ...(search && { search }),
            signal,
          });
        }
    
        // Fallback: If no group, fetch all sites using the old method
        const { getSitesSummaryApi } = await import('../apis/Analytics');
        return getSitesSummaryApi({ 
          ...params, 
          ...(search && { search }),
          signal 
        });
      },
      [normalizedGroup, search],
    );

  return usePaginatedData(
    ['sites-summary-paginated', normalizedGroup || 'all', search || ''],
    fetcher,
    {
      initialLimit: 20,
      maxLimit: 80,
      ...restOptions,
      search,
    },
  );
};

/**
 * Specialized hook for devices summary with pagination
 */
export const usePaginatedDevicesSummary = (group, options = {}) => {
  const { search = '', category = 'lowcost', ...rest } = options;
  const normalizedGroup =
    typeof group === 'string' && group.trim().length > 0 ? group.trim() : '';

    const fetcher = useCallback(
      async (params, signal) => {
        if (!normalizedGroup) return { devices: [], meta: {} };
    
        const { getGroupCohortsApi } = await import('../apis/Account');
        const { getDevicesForCohortsApi } = await import('../apis/DeviceRegistry');
    
        // Step 1: Fetch cohorts for the group
        const cohortsResponse = await getGroupCohortsApi(normalizedGroup, signal);
        const cohortIds = cohortsResponse?.data || [];
    
        if (cohortIds.length === 0) {
          return { devices: [], meta: {} };
        }
    
        // Step 2: Fetch devices for the retrieved cohorts
        return getDevicesForCohortsApi(
          {
            cohort_ids: cohortIds,
            skip: params.skip,
            limit: params.limit,
            category: category,
            ...(search && { search }),
          },
          signal,
        );
      },
      [normalizedGroup, category, search],
    );

  return usePaginatedData(
    ['devices-summary-paginated', normalizedGroup || 'all', category, search || ''],
    fetcher,
    {
      initialLimit: 20,
      maxLimit: 80,
      ...rest,
      search,
    },
  );
};

/**
 * Specialized hook for grids summary with pagination
 */
export const usePaginatedGridsSummary = (adminLevel, options = {}) => {
  const { search = '', ...restOptions } = options;

  const fetcher = useCallback(
    async (params, signal) => {
      const { getGridSummaryApi } = await import('../apis/Analytics');
      return getGridSummaryApi({
        admin_level: adminLevel,
        skip: params.skip,
        limit: params.limit,
        search: params.search,
        signal,
      });
    },
    [adminLevel],
  );

  return usePaginatedData(
    ['grids-summary-paginated', adminLevel || 'all', search || ''],
    fetcher,
    {
      initialLimit: 20,
      maxLimit: 80,
      ...restOptions,
      search,
    },
  );
};

export default usePaginatedData;
