import { useState, useCallback, useMemo, useRef } from 'react';
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
      },
    ];
  }, [baseKey, baseParams, skip, limit, currentPage]);

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
        if (error.name === 'AbortError') {
          logger.info('Request was aborted');
          return null;
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
      revalidateOnMount: true,
      dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
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
    return [];
  }, [data]);

  // Update allData for infinite scroll
  const handleDataUpdate = useCallback(() => {
    if (!enableInfiniteScroll || !currentPageData.length) return;

    setAllData((prevAll) => {
      // For first page or reset, replace all data
      if (currentPage === 1 || prevAll.length === 0) {
        return [...currentPageData];
      }

      // For subsequent pages, append new data (avoiding duplicates)
      const existingIds = new Set(prevAll.map((item) => item._id || item.id));
      const newItems = currentPageData.filter(
        (item) => !existingIds.has(item._id || item.id),
      );

      return [...prevAll, ...newItems];
    });
  }, [enableInfiniteScroll, currentPageData, currentPage]);

  // Effect to update combined data when new data arrives
  useMemo(() => {
    if (currentPageData.length > 0) {
      handleDataUpdate();
    }
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
    if (isLoadingMore || isLoading || !meta.nextPage) return;

    setIsLoadingMore(true);
    try {
      // Go to next page which will automatically fetch and append data
      nextPage();
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, isLoading, meta.nextPage, nextPage]);

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
  useMemo(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

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
  const normalizedGroup =
    typeof group === 'string' && group.trim().length > 0 ? group.trim() : '';

  const fetcher = useCallback(
    async (params) => {
      const { getSitesSummaryApi } = await import('../apis/Analytics');
      const groupParam = normalizedGroup || undefined;
      return getSitesSummaryApi({
        group: groupParam,
        skip: params.skip,
        limit: params.limit,
      });
    },
    [normalizedGroup],
  );

  return usePaginatedData(
    ['sites-summary-paginated', normalizedGroup || 'all'],
    fetcher,
    {
      initialLimit: 20,
      maxLimit: 100,
      ...options,
    },
  );
};

/**
 * Specialized hook for devices summary with pagination
 */
export const usePaginatedDevicesSummary = (group, options = {}) => {
  const normalizedGroup =
    typeof group === 'string' && group.trim().length > 0 ? group.trim() : '';

  const fetcher = useCallback(
    async (params) => {
      const { getDeviceSummaryApi } = await import('../apis/Analytics');
      const groupParam = normalizedGroup || undefined;
      return getDeviceSummaryApi({
        group: groupParam,
        status: 'deployed',
        skip: params.skip,
        limit: params.limit,
      });
    },
    [normalizedGroup],
  );

  return usePaginatedData(
    ['devices-summary-paginated', normalizedGroup || 'all'],
    fetcher,
    {
      initialLimit: 20,
      maxLimit: 100,
      ...options,
    },
  );
};

/**
 * Specialized hook for grids summary with pagination
 */
export const usePaginatedGridsSummary = (adminLevel, options = {}) => {
  const fetcher = useCallback(
    async (params) => {
      const { getGridSummaryApi } = await import('../apis/Analytics');
      return getGridSummaryApi({
        admin_level: adminLevel,
        skip: params.skip,
        limit: params.limit,
      });
    },
    [adminLevel],
  );

  return usePaginatedData(
    ['grids-summary-paginated', adminLevel || 'all'],
    fetcher,
    {
      initialLimit: 20,
      maxLimit: 100,
      ...options,
    },
  );
};

export default usePaginatedData;
