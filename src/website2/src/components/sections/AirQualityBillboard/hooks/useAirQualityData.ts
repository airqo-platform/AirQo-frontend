import { useCallback, useEffect, useRef, useState } from 'react';
import { mutate } from 'swr';

import { useCohortsSummary, useGridsSummary } from '@/hooks/useApiHooks';
import { cohortsService, gridsService } from '@/services/apiService';

import type { DataType } from '../types';
import { parseNextPageParams } from '../utils';

export const useAirQualityData = (
  dataType: DataType,
  propItemName?: string,
) => {
  const [allCohorts, setAllCohorts] = useState<any[]>([]);
  const [allGrids, setAllGrids] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const isMountedRef = useRef(true);

  // Fetch parameters
  const cohortsParams =
    propItemName && dataType === 'cohort'
      ? { limit: 80, search: propItemName }
      : { limit: 80 };
  const gridsParams =
    propItemName && dataType === 'grid'
      ? { limit: 80, search: propItemName }
      : { limit: 80 };

  // Summary data hooks
  const {
    data: cohortsData,
    isLoading: cohortsLoading,
    error: cohortsError,
  } = useCohortsSummary(dataType === 'cohort' ? cohortsParams : undefined);

  const {
    data: gridsData,
    isLoading: gridsLoading,
    error: gridsError,
  } = useGridsSummary(dataType === 'grid' ? gridsParams : undefined);

  // Accumulate summary data
  useEffect(() => {
    if (cohortsData?.cohorts) {
      setAllCohorts((prev) => {
        const existingIds = new Set(prev.map((c) => c._id));
        const newCohorts = cohortsData.cohorts.filter(
          (c) => !existingIds.has(c._id),
        );
        return [...prev, ...newCohorts];
      });
    }
  }, [cohortsData]);

  useEffect(() => {
    if (gridsData?.grids) {
      setAllGrids((prev) => {
        const existingIds = new Set(prev.map((g) => g._id));
        const newGrids = gridsData.grids.filter((g) => !existingIds.has(g._id));
        return [...prev, ...newGrids];
      });
    }
  }, [gridsData]);

  // Load more pages
  useEffect(() => {
    if (!isMountedRef.current || loadingMore) return;

    const meta = dataType === 'cohort' ? cohortsData?.meta : gridsData?.meta;
    if (meta?.nextPage && !loadingMore) {
      setLoadingMore(true);
      const _params = parseNextPageParams(meta.nextPage);
      // Load more data
      const loadMore = async () => {
        try {
          if (dataType === 'cohort') {
            const response = await cohortsService.getCohortsSummary(_params);
            if (response.success && response.cohorts) {
              setAllCohorts((prev) => {
                const existingIds = new Set(prev.map((c) => c._id));
                const newCohorts = response.cohorts.filter(
                  (c) => !existingIds.has(c._id),
                );
                return [...prev, ...newCohorts];
              });
            }
          } else {
            const response = await gridsService.getGridsSummary(_params);
            if (response.success && response.grids) {
              setAllGrids((prev) => {
                const existingIds = new Set(prev.map((g) => g._id));
                const newGrids = response.grids.filter(
                  (g) => !existingIds.has(g._id),
                );
                return [...prev, ...newGrids];
              });
            }
          }
        } catch (error) {
          console.error('Failed to load more data:', error);
        } finally {
          setLoadingMore(false);
        }
      };
      loadMore();
    }
  }, [cohortsData, gridsData, dataType, loadingMore]);

  // Clear cache when switching data types
  const clearDataTypeCache = useCallback((newDataType: DataType) => {
    if (newDataType === 'grid') {
      mutate(
        (key) => typeof key === 'string' && key.startsWith('cohortsSummary'),
      );
      mutate(
        (key) =>
          typeof key === 'string' && key.startsWith('cohortMeasurements'),
      );
    } else {
      mutate(
        (key) => typeof key === 'string' && key.startsWith('gridsSummary'),
      );
      mutate(
        (key) => typeof key === 'string' && key.startsWith('gridMeasurements'),
      );
    }

    // Clear all measurements cache
    mutate(
      (key) => typeof key === 'string' && key.startsWith('cohortMeasurements'),
    );
    mutate(
      (key) => typeof key === 'string' && key.startsWith('gridMeasurements'),
    );
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
    cohortsData,
    gridsData,
    allCohorts,
    allGrids,

    // Loading states
    cohortsLoading,
    gridsLoading,
    loadingMore,

    // Errors
    cohortsError,
    gridsError,

    // Parameters
    cohortsParams,
    gridsParams,

    // Actions
    clearDataTypeCache,
  };
};
