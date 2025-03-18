import useSWR from 'swr';
import {
  getSitesSummaryApi,
  getDeviceSummaryApi,
  getGridSummaryApi,
} from '../apis/Analytics';
import { SWR_CONFIG } from '../swrConfigs';

/**
 * Hook for fetching sites summary data
 * @param {string} group - Group filter
 * @param {Object} options - SWR options
 * @returns {Object} SWR response with data, loading and error states
 */
export const useSitesSummary = (group, options = {}) => {
  const { data, error, isLoading, mutate } = useSWR(
    group ? ['sites-summary', group] : null,
    async () => await getSitesSummaryApi({ group }),
    { ...SWR_CONFIG, ...options },
  );

  return {
    data: data?.sites || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
};

/**
 * Hook for fetching device summary data
 * @param {string|null} group - Optional group filter
 * @param {Object} options - SWR options
 * @returns {Object} SWR response with data, loading and error states
 */
export const useDeviceSummary = (group = null, options = {}) => {
  const { data, error, isLoading, mutate } = useSWR(
    ['device-summary', group],
    async () => await getDeviceSummaryApi({ group }),
    { ...SWR_CONFIG, ...options },
  );

  return {
    data: data?.devices || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
};

/**
 * Hook for fetching grid summary data
 * @param {string|null} admin_level - Optional admin level filter
 * @param {Object} options - SWR options
 * @returns {Object} SWR response with data, loading and error states
 */
export const useGridSummary = (admin_level = null, options = {}) => {
  const { data, error, isLoading, mutate } = useSWR(
    ['grid-summary', admin_level],
    async () => await getGridSummaryApi({ admin_level }),
    { ...SWR_CONFIG, ...options },
  );

  return {
    data: data?.grids || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
};
