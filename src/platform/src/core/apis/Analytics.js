import { secureApiProxy, AUTH_TYPES } from '../utils/secureApiProxyClient';
import logger from '@/lib/logger';
import {
  DATA_EXPORT_URL,
  SHARE_REPORT_URL,
  SITES_SUMMARY_URL,
  DEVICE_SUMMARY_URL,
  GRID_SUMMARY_URL,
  ANALYTICS_URL,
  DEVICE_READINGS_RECENT_URL,
  GENERATE_SITE_AND_DEVICE_IDS,
} from '../urls/analytics';

// Export data to file
export const exportDataApi = async (body) => {
  const response = await secureApiProxy.post(DATA_EXPORT_URL, body, {
    authType: AUTH_TYPES.JWT,
  });
  return response.data;
};

// Share report via email
export const shareReportApi = async (body) => {
  const response = await secureApiProxy.post(SHARE_REPORT_URL, body, {
    authType: AUTH_TYPES.JWT,
  });
  return response.data;
};

// Get sites summary data
export const getSitesSummaryApi = async ({ group }) => {
  return secureApiProxy
    .get(SITES_SUMMARY_URL, {
      params: { group },
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data)
    .catch(() => ({ sites: [] }));
};

// Get device summary data
export const getDeviceSummaryApi = async ({ group = null }) => {
  const params = {
    status: 'deployed',
    ...(group ? { group } : {}),
  };

  return secureApiProxy
    .get(DEVICE_SUMMARY_URL, {
      params,
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data)
    .catch(() => ({ devices: [] }));
};

// Get grid summary data
export const getGridSummaryApi = async ({ admin_level = null }) => {
  const params = admin_level ? { admin_level } : {};

  return secureApiProxy
    .get(GRID_SUMMARY_URL, {
      params,
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data)
    .catch(() => ({ grids: [] }));
};

// Fetch analytics data
export const getAnalyticsDataApi = async ({ body }) => {
  try {
    // Validate input parameters
    if (
      !body ||
      !body.sites ||
      !Array.isArray(body.sites) ||
      body.sites.length === 0
    ) {
      logger.warn('Invalid or empty sites provided to analytics API');
      return [];
    }

    // Validate date range
    if (!body.startDate || !body.endDate) {
      logger.warn('Invalid date range provided to analytics API');
      return [];
    }

    // Check if dates are valid
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      logger.warn('Invalid date format provided to analytics API');
      return [];
    }

    // Ensure site_id is requested in metadata fields
    const enrichedBody = {
      ...body,
      metaDataFields: Array.isArray(body.metaDataFields)
        ? Array.from(new Set([...body.metaDataFields, 'site_id']))
        : ['site_id'],
    };

    return secureApiProxy
      .post(ANALYTICS_URL, enrichedBody, {
        authType: AUTH_TYPES.JWT,
        timeout: 30000, // 30 second timeout
      })
      .then((response) => {
        if (response?.data?.status === 'success')
          return response.data.data || [];
        if (response?.status === 'success' && Array.isArray(response.data))
          return response.data;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      })
      .catch((error) => {
        logger.error('Analytics API error:', error);
        // Log detailed error information for debugging
        if (error.response) {
          logger.error('Analytics API Response status:', error.response.status);
          logger.error('Analytics API Response data:', error.response.data);
        }
        return [];
      });
  } catch (error) {
    logger.error('Analytics API validation error:', error);
    return [];
  }
};

// Get recent device measurements
export const getRecentMeasurements = async (params) => {
  return secureApiProxy
    .get(DEVICE_READINGS_RECENT_URL, {
      params,
      authType: AUTH_TYPES.API_TOKEN,
    })
    .then((response) => response.data)
    .catch(() => ({}));
};

// Generate site and device IDs for a grid
export const generateSiteAndDeviceIds = async (grid_id) => {
  if (!grid_id) {
    return Promise.reject(new Error('Grid ID is required'));
  }

  return secureApiProxy
    .get(`${GENERATE_SITE_AND_DEVICE_IDS}/${grid_id}/generate`, {
      authType: AUTH_TYPES.JWT,
      timeout: 30000, // 30 second timeout for grid generation
    })
    .then((response) => response.data)
    .catch((error) => {
      logger.error('Grid generation API error:', error);
      // Log detailed error information for debugging
      if (error.response) {
        logger.error('Grid API Response status:', error.response.status);
        logger.error('Grid API Response data:', error.response.data);
      }
      return {}; // Return empty object to prevent breaks
    });
};
