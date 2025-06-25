import useSWR from 'swr';
import {
  getSitesSummaryApi,
  getDeviceSummaryApi,
  getGridSummaryApi,
  getAnalyticsDataApi,
  getRecentMeasurements,
  generateSiteAndDeviceIds,
} from '../apis/Analytics';
import { format } from 'date-fns';
import { ANALYTICS_SWR_CONFIG, SWR_CONFIG } from '../swrConfigs';

// Util Methods
/**
 * Format date to API required format
 * @param {Date|string} date - Date to format
 * @returns {string|null} - Formatted date string or null if date is invalid
 */
const formatDate = (date) => {
  if (!date) return null;

  try {
    // Ensure we're working with a Date object
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) return null;

    return format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
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
  } = params || {};

  // Skip fetch if essential parameters are missing
  if (
    !selectedSiteIds?.length ||
    !dateRange?.startDate ||
    !dateRange?.endDate
  ) {
    return null;
  }

  const startDateFormatted = formatDate(dateRange.startDate);
  const endDateFormatted = formatDate(dateRange.endDate);

  // Skip fetch if dates couldn't be formatted properly
  if (!startDateFormatted || !endDateFormatted) {
    return null;
  }

  // Optimize key generation for better cache hits
  return [
    'analytics',
    // Sort site IDs to ensure consistent cache keys regardless of order
    JSON.stringify([...selectedSiteIds].sort()),
    startDateFormatted,
    endDateFormatted,
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
  // Use default values if params are undefined
  const safeParams = params || {};

  const {
    selectedSiteIds = [],
    dateRange = { startDate: new Date(), endDate: new Date() },
    chartType = 'line',
    frequency = 'daily',
    pollutant = 'pm2_5',
    organisationName = '',
  } = safeParams;

  // Generate cache key for SWR
  const swrKey = getAnalyticsKey({
    selectedSiteIds,
    dateRange,
    chartType,
    frequency,
    pollutant,
    organisationName,
  });
  // Use SWR for data fetching with caching
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    async () => {
      try {
        // Prepare request body with formatted dates
        const startDateFormatted = formatDate(dateRange.startDate);
        const endDateFormatted = formatDate(dateRange.endDate);

        if (!startDateFormatted || !endDateFormatted) {
          throw new Error('Invalid date range');
        }

        const requestBody = {
          sites: selectedSiteIds,
          startDate: startDateFormatted,
          endDate: endDateFormatted,
          chartType,
          frequency,
          pollutant,
          organisation_name: organisationName,
        };

        const result = await getAnalyticsDataApi({ body: requestBody });
        return result;
      } catch (error) {
        console.error('Error in analytics data fetcher:', error);
        throw error; // Re-throw to let SWR handle error state
      }
    },
    { ...ANALYTICS_SWR_CONFIG, ...options },
  );

  return {
    allSiteData: Array.isArray(data) ? data : [],
    chartLoading: isLoading,
    isValidating,
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

/**
 * Hook for generating site and device IDs for a given grid ID
 * @param {string} grid_id - Grid ID
 * @returns {Object} SWR response with data, loading and error states
 */
export const useSiteAndDeviceIds = (grid_id) => {
  const { data, error, isLoading, mutate } = useSWR(
    grid_id ? ['site-and-device-ids', grid_id] : null,
    () => generateSiteAndDeviceIds(grid_id),
    { ...SWR_CONFIG },
  );

  return {
    data: data?.sites_and_devices || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
};
