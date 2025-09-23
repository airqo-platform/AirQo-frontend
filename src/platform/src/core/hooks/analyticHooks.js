import useSWR from 'swr';
import {
  getSitesSummaryApi,
  getDeviceSummaryApi,
  getGridSummaryApi,
  getAnalyticsDataApi,
  getRecentMeasurements,
  generateSiteAndDeviceIds,
} from '../apis/Analytics';
import { ANALYTICS_SWR_CONFIG, SWR_CONFIG } from '../swrConfigs';
import logger from '@/lib/logger';

const formatDate = (() => {
  const cache = new Map();

  return (date) => {
    if (!date) return null;

    const key = date instanceof Date ? date.getTime() : date;
    if (cache.has(key)) return cache.get(key);

    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return null;

      // Use real UTC string instead of local-time formatted as UTC
      const formatted = dateObj.toISOString();

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

const getAnalyticsKey = (params) => {
  const {
    selectedSiteIds,
    dateRange,
    chartType,
    frequency,
    pollutant,
    organisationName,
  } = params || {};

  if (
    !selectedSiteIds?.length ||
    !dateRange?.startDate ||
    !dateRange?.endDate
  ) {
    return null;
  }

  const startDateFormatted = formatDate(dateRange.startDate);
  const endDateFormatted = formatDate(dateRange.endDate);

  if (!startDateFormatted || !endDateFormatted) return null;

  const sortedSiteIds = [...selectedSiteIds].sort().join(',');

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

export const useSitesSummary = (group, options = {}) => {
  const normalized =
    typeof group === 'string' && group.trim().length > 0 ? group.trim() : '';

  const { data, error, isLoading, mutate } = useSWR(
    ['sites-summary', normalized || 'all'],
    async () => {
      const groupParam = normalized || undefined;
      const result = await getSitesSummaryApi({ group: groupParam });
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

export const useDeviceSummary = (group = null, options = {}) => {
  const normalized =
    typeof group === 'string' && group.trim().length > 0 ? group.trim() : '';
  const { data, error, isLoading, mutate } = useSWR(
    ['device-summary', normalized || 'all'],
    async () => {
      const groupParam = normalized || undefined;
      const result = await getDeviceSummaryApi({ group: groupParam });
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

export const useAnalyticsData = (params, options = {}) => {
  const {
    selectedSiteIds = [],
    dateRange = { startDate: new Date(), endDate: new Date() },
    chartType = 'line',
    frequency = 'daily',
    pollutant = 'pm2_5',
    organisationName = '',
  } = params || {};

  const swrKey =
    params && selectedSiteIds.length > 0
      ? getAnalyticsKey({
          selectedSiteIds,
          dateRange,
          chartType,
          frequency,
          pollutant,
          organisationName,
        })
      : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    async () => {
      try {
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
          metaDataFields: ['site_id'],
        };

        const result = await getAnalyticsDataApi({ body: requestBody });
        return result;
      } catch (error) {
        logger.error('Error in analytics data fetcher:', error);
        throw error;
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
// (no-op) analytic hooks implementation only — removed accidental re-export

// Export the new pagination hooks for enhanced data loading
export {
  usePaginatedData,
  usePaginatedSitesSummary,
  usePaginatedDevicesSummary,
  usePaginatedGridsSummary,
  usePaginatedMobileDevices,
} from './usePaginatedData';
