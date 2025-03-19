import useSWR from 'swr';
import {
  getSitesSummaryApi,
  getDeviceSummaryApi,
  getGridSummaryApi,
  getAnalyticsDataApi,
  getRecentMeasurements,
} from '../apis/Analytics';
import { format } from 'date-fns';
import { ANALYTICS_SWR_CONFIG, SWR_CONFIG } from '../swrConfigs';

// Util Methods
/**
 * Format date to API required format with memoization capability
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
  if (!date) return null;
  // Ensure we're working with a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
};

/**
 * Custom SWR key generator for analytics data
 * @param {Object} params - Analytics parameters
 * @returns {Array|null} - SWR key array or null if params are invalid
 */
const getAnalyticsKey = (params) => {
  const {
    selectedSiteIds,
    dateRange,
    chartType,
    frequency,
    pollutant,
    organisationName,
  } = params;

  // Skip fetch if essential parameters are missing
  if (
    !selectedSiteIds?.length ||
    !dateRange?.startDate ||
    !dateRange?.endDate
  ) {
    return null;
  }

  // Optimize key generation for better cache hits
  return [
    'analytics',
    // Sort site IDs to ensure consistent cache keys regardless of order
    JSON.stringify([...selectedSiteIds].sort()),
    formatDate(dateRange.startDate),
    formatDate(dateRange.endDate),
    chartType || 'line',
    frequency || 'daily',
    pollutant || 'pm2_5',
    organisationName || '',
  ];
};

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

/**
 * Hook for fetching analytics data using SWR
 * @param {Object} params - Analytics parameters
 * @param {Array} params.selectedSiteIds - Array of site IDs
 * @param {Object} params.dateRange - Object containing startDate and endDate
 * @param {string} params.chartType - Type of chart (line, bar, etc.)
 * @param {string} params.frequency - Data frequency (hourly, daily, etc.)
 * @param {string} params.pollutant - Pollutant type (pm2_5, etc.)
 * @param {string} params.organisationName - Organization name
 * @param {Object} options - SWR options
 * @returns {Object} - SWR response with data, loading and error states
 */
export const useAnalyticsData = (params, options = {}) => {
  const {
    selectedSiteIds = [],
    dateRange = { startDate: new Date(), endDate: new Date() },
    chartType = 'line',
    frequency = 'daily',
    pollutant = 'pm2_5',
    organisationName,
  } = params;

  // Generate cache key
  const swrKey = getAnalyticsKey({
    selectedSiteIds,
    dateRange,
    chartType,
    frequency,
    pollutant,
    organisationName,
  });

  // Use SWR with optimized fetcher
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token missing');
      }

      // Prepare request body with formatted dates
      const requestBody = {
        sites: selectedSiteIds,
        startDate: formatDate(dateRange.startDate),
        endDate: formatDate(dateRange.endDate),
        chartType,
        frequency,
        pollutant,
        organisation_name: organisationName,
      };

      return await getAnalyticsDataApi({ body: requestBody });
    },
    { ...ANALYTICS_SWR_CONFIG, ...options },
  );

  return {
    allSiteData: data || [],
    chartLoading: isLoading,
    isValidating, // Added to show background refresh status
    isError: !!error,
    error,
    refetch: mutate,
  };
};

/**
 * Hook for fetching and managing recent measurements data using SWR
 * @param {Object} params - Query parameters for the request
 * @param {Object} options - Additional SWR configuration options
 * @returns {Object} SWR state and methods
 */
export const useRecentMeasurements = (params, options = {}) => {
  const { data, error, isLoading, mutate } = useSWR(
    params ? ['recent-measurements', params] : null,
    () => getRecentMeasurements(params),
    { ...SWR_CONFIG, ...options },
  );

  return {
    data: data?.measurements || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
};
