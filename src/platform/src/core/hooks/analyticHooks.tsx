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
import logger from '../../lib/logger';

// Optimized date formatting with memoization
const formatDate = (() => {
  const cache = new Map();

  return (date) => {
    if (!date) return null;

    // Create cache key
    const key = date instanceof Date ? date.getTime() : date;
    if (cache.has(key)) {
      return cache.get(key);
    }

    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return null;

      const formatted = format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

      // Cache result (limit cache size)
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, formatted);

      return formatted;
    } catch (error) {
      logger.error('Error formatting date:', error);
      return null;
    }
  };
})();

// Optimized analytics key generator with stable sorting
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

  if (!startDateFormatted || !endDateFormatted) {
    return null;
  }

  // Create stable key with sorted site IDs
  const sortedSiteIds = [...selectedSiteIds].sort().join(',');

  // Return more concise key
  return [
    'analytics',
    sortedSiteIds,
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
    async () => {
      const result = await getSitesSummaryApi({ group });
      return result;
    },
    {
      ...SWR_CONFIG,
      revalidateOnMount: true,
      ...options,
    },
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
    async () => {
      const result = await getDeviceSummaryApi({ group });
      return result;
    },
    {
      ...SWR_CONFIG,
      revalidateOnMount: true,
      ...options,
    },
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
    async () => {
      const result = await getGridSummaryApi({ admin_level });
      return result;
    },
    {
      ...SWR_CONFIG,
      revalidateOnMount: true,
      ...options,
    },
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
        logger.error('Error in analytics data fetcher:', error);
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
    async () => {
      const result = await generateSiteAndDeviceIds(grid_id);
      return result;
    },
    {
      ...SWR_CONFIG,
      revalidateOnMount: true,
    },
  );

  // Always return an object with site_ids and device_ids arrays for safety
  const safeData =
    data?.sites_and_devices && typeof data.sites_and_devices === 'object'
      ? data.sites_and_devices
      : { site_ids: [], device_ids: [] };

  return {
    data: safeData,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
};
