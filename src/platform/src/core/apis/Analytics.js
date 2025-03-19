import createAxiosInstance from './axiosConfig';
import {
  DATA_EXPORT_URL,
  SHARE_REPORT_URL,
  SITES_SUMMARY_URL,
  DEVICE_SUMMARY_URL,
  GRID_SUMMARY_URL,
  ANALYTICS_URL,
  DEVICE_READINGS_RECENT_URL,
} from '../urls/analytics';
import axios from 'axios';

// Utility function to handle API errors
const handleApiError = (error, customMessage = 'An error occurred') => {
  console.error(`${customMessage}:`, error);
  throw error;
};

/**
 * Export data API
 * @param {Object} body - Request body
 * @returns {Promise<Object>} Response data
 */
export const exportDataApi = async (body) => {
  try {
    const response = await createAxiosInstance().post(DATA_EXPORT_URL, body);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error exporting data');
  }
};

/**
 * Share report API
 * @param {Object} body - Request body
 * @returns {Promise<Object>} Response data
 */
export const shareReportApi = async (body) => {
  try {
    const response = await createAxiosInstance().post(SHARE_REPORT_URL, body);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error sharing report');
  }
};

/**
 * Get sites summary
 * @param {Object} options - Request options
 * @param {string} options.group - Group filter
 * @returns {Promise<Object>} Sites summary data
 */
export const getSitesSummaryApi = async ({ group }) => {
  try {
    let response;

    if (process.env.NODE_ENV === 'development') {
      // Use proxy endpoint in development mode
      response = await axios.get('/api/proxy/sites', {
        headers: {
          'Content-Type': 'application/json',
        },
        params: { group },
      });
    } else {
      // Use direct API endpoint in production mode
      response = await createAxiosInstance(false).get(SITES_SUMMARY_URL, {
        params: { group },
      });
    }

    // Add validation to ensure response.data exists
    if (!response || !response.data) {
      throw new Error('Invalid response received from API');
    }

    return response.data;
  } catch (error) {
    handleApiError(error, 'Error fetching sites summary');
    return { sites: [] };
  }
};

/**
 * Get device summary
 * @param {Object} options - Request options
 * @param {string|null} options.group - Optional group filter
 * @returns {Promise<Object>} Device summary data
 */
export const getDeviceSummaryApi = async ({ group = null }) => {
  try {
    let response;
    const params = {};
    if (group) params.group = group;

    if (process.env.NODE_ENV === 'development') {
      // Use proxy endpoint in development mode
      response = await axios.get('/api/proxy/devices', {
        headers: {
          'Content-Type': 'application/json',
        },
        params,
      });
    } else {
      // Use direct API endpoint in production mode
      response = await createAxiosInstance(false).get(DEVICE_SUMMARY_URL, {
        params,
      });
    }

    // Add validation to ensure response.data exists
    if (!response || !response.data) {
      throw new Error('Invalid response received from API');
    }

    return response.data;
  } catch (error) {
    handleApiError(error, 'Error fetching device summary');
    return { devices: [] };
  }
};

/**
 * Get grid summary
 * @param {Object} options - Request options
 * @param {string|null} options.admin_level - Optional admin level filter
 * @returns {Promise<Object>} Grid summary data
 */
export const getGridSummaryApi = async ({ admin_level = null }) => {
  try {
    let response;
    const params = {};
    if (admin_level) params.admin_level = admin_level;

    if (process.env.NODE_ENV === 'development') {
      // Use proxy endpoint in development mode
      response = await axios.get('/api/proxy/grids', {
        headers: {
          'Content-Type': 'application/json',
        },
        params,
      });
    } else {
      // Use direct API endpoint in production mode
      response = await createAxiosInstance().get(GRID_SUMMARY_URL, {
        params,
      });
    }

    // Add validation to ensure response.data exists
    if (!response || !response.data) {
      throw new Error('Invalid response received from API');
    }

    return response.data;
  } catch (error) {
    handleApiError(error, 'Error fetching grid summary');
    return { grids: [] };
  }
};

/**
 * Fetches analytics data from the API
 * @param {Object} options - Request options
 * @param {Object} options.body - Request body containing analytics parameters
 * @returns {Promise<Object>} - Promise resolving to analytics data
 */
export const getAnalyticsDataApi = async ({ body }) => {
  try {
    // Get auth token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authorization token is missing');
    }

    let response;

    if (process.env.NODE_ENV === 'development') {
      // Development environment - use proxy endpoint
      response = await axios.post('/api/proxy/analytics', body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });
    } else {
      // Production environment - use direct API endpoint
      response = await createAxiosInstance(false).post(ANALYTICS_URL, body);
    }

    // Process response
    if (response?.data?.status === 'success') {
      return response.data.data || [];
    }

    // Handle alternate success response format
    if (response?.status === 'success' && Array.isArray(response.data)) {
      return response.data;
    }

    // Handle edge case where data is directly in response
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    // No valid data found in response
    throw new Error(
      response?.data?.message || 'Failed to fetch analytics data',
    );
  } catch (error) {
    // Log error and re-throw for better debugging
    console.error('Analytics API error:', error);
    handleApiError(error, 'Error fetching analytics data');
    return [];
  }
};

/**
 * Fetches recent measurements data from the API
 * @param {Object} params - Query parameters for the API request
 * @returns {Promise<Object>} The recent measurements data
 */
export const getRecentMeasurements = (params) =>
  createAxiosInstance(false)
    .get(DEVICE_READINGS_RECENT_URL, { params })
    .then((response) => response.data);
