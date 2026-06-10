import { useCallback, useEffect, useRef, useState } from 'react';

import { useGridsSummary } from '@/hooks/useApiHooks';
import { gridsService } from '@/services/apiService';
import { queryClient } from '@/services/queryClient';
import { apiQueryKeys } from '@/services/queryKeys';

import type { DataType, Grid } from '../types';
import { parseNextPageParams } from '../utils';

export const useAirQualityData = (
  dataType: DataType,
  propItemName?: string,
) => {
  const [allGrids, setAllGrids] = useState<Grid[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedPages, setLoadedPages] = useState<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  // Fetch parameters
  const gridsParams =
    propItemName && dataType === 'grid'
      ? { limit: 80, search: propItemName }
      : { limit: 80 };

  // Summary data hooks
  const {
    data: gridsData,
    isLoading: gridsLoading,
    error: gridsError,
  } = useGridsSummary(dataType === 'grid' ? gridsParams : undefined);

  // Accumulate summary data
  useEffect(() => {
    if (gridsData?.grids) {
      setAllGrids((prev) => {
        const existingIds = new Set(prev.map((grid) => grid._id));
        const newGrids = gridsData.grids.filter(
          (grid: Grid) => !existingIds.has(grid._id),
        );
        return [...prev, ...newGrids];
      });
    }
  }, [gridsData]);

  // Load more pages
  useEffect(() => {
    if (!isMountedRef.current || loadingMore) return;

    const meta = gridsData?.meta;
    if (meta?.nextPage && !loadingMore) {
      const nextPageKey = `grid-${meta.nextPage}`;
      if (loadedPages.has(nextPageKey)) return; // Prevent duplicate loads

      setLoadingMore(true);
      setLoadedPages((prev) => {
        const newSet = new Set(prev);
        newSet.add(nextPageKey);
        return newSet;
      });
      const _params = parseNextPageParams(meta.nextPage);
      // Load more data
      const loadMore = async () => {
        try {
          const response = await queryClient.fetchQuery({
            queryKey: apiQueryKeys.gridsSummary(_params),
            queryFn: () => gridsService.getGridsSummary(_params),
            staleTime: 5 * 60 * 1000,
          });

          if (response?.grids) {
            setAllGrids((prev) => {
              const existingIds = new Set(prev.map((grid) => grid._id));
              const newGrids = response.grids.filter(
                (grid: Grid) => !existingIds.has(grid._id),
              );
              return [...prev, ...newGrids];
            });
          }
        } catch (error) {
          console.error('Failed to load more data:', error);
        } finally {
          setLoadingMore(false);
        }
      };
      loadMore();
    }
  }, [gridsData, loadingMore, loadedPages]);

  // Clear cache when switching data types
  const clearDataTypeCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['gridsSummary'] });
    queryClient.invalidateQueries({ queryKey: ['gridMeasurements'] });

    // Reset loaded pages tracking
    setLoadedPages(new Set());
  }, []);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    // Data
    gridsData,
    allGrids,

    // Loading states
    gridsLoading,
    loadingMore,

    // Errors
    gridsError,

    // Parameters
    gridsParams,

    // Actions
    clearDataTypeCache,
  };
};
