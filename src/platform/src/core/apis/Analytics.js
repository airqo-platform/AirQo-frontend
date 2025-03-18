import createAxiosInstance from './axiosConfig';
import {
  DATA_EXPORT_URL,
  SHARE_REPORT_URL,
  SITES_SUMMARY_URL,
  DEVICE_SUMMARY_URL,
  GRID_SUMMARY_URL,
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
      response = await createAxiosInstance().get(SITES_SUMMARY_URL, {
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
      response = await createAxiosInstance().get(DEVICE_SUMMARY_URL, {
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
