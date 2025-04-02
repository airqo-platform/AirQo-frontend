import { api, publicApi } from '../utils/apiClient';
import axios from 'axios';
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

// Helper function to safely get token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('token');
  }
  return null;
};

// Export data to file
export const exportDataApi = async (body) => {
  const response = await api.post(DATA_EXPORT_URL, body);
  return response.data;
};

// Share report via email
export const shareReportApi = async (body) => {
  const response = await api.post(SHARE_REPORT_URL, body);
  return response.data;
};

// Get sites summary data
export const getSitesSummaryApi = async ({ group }) => {
  if (process.env.NODE_ENV === 'development') {
    return axios
      .get('/api/proxy/sites', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: getToken(),
        },
        params: { group },
      })
      .then((response) => response.data)
      .catch(() => ({ sites: [] }));
  }

  return api
    .get(SITES_SUMMARY_URL, { params: { group } })
    .then((response) => response.data)
    .catch(() => ({ sites: [] }));
};

// Get device summary data
export const getDeviceSummaryApi = async ({ group = null }) => {
  const params = group ? { group } : {};

  if (process.env.NODE_ENV === 'development') {
    return axios
      .get('/api/proxy/devices', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: getToken(),
        },
        params,
      })
      .then((response) => response.data)
      .catch(() => ({ devices: [] }));
  }

  return api
    .get(DEVICE_SUMMARY_URL, { params })
    .then((response) => response.data)
    .catch(() => ({ devices: [] }));
};

// Get grid summary data
export const getGridSummaryApi = async ({ admin_level = null }) => {
  const params = admin_level ? { admin_level } : {};

  if (process.env.NODE_ENV === 'development') {
    return axios
      .get('/api/proxy/grids', {
        headers: { 'Content-Type': 'application/json' },
        params,
      })
      .then((response) => response.data)
      .catch(() => ({ grids: [] }));
  }

  return api
    .get(GRID_SUMMARY_URL, { params })
    .then((response) => response.data)
    .catch(() => ({ grids: [] }));
};

// Fetch analytics data
export const getAnalyticsDataApi = async ({ body }) => {
  if (process.env.NODE_ENV === 'development') {
    return axios
      .post('/api/proxy/analytics', body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: getToken(),
        },
      })
      .then((response) => {
        if (response?.data?.status === 'success')
          return response.data.data || [];
        if (response?.status === 'success' && Array.isArray(response.data))
          return response.data;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      })
      .catch(() => []);
  }

  return api
    .post(ANALYTICS_URL, body)
    .then((response) => {
      if (response?.data?.status === 'success') return response.data.data || [];
      if (response?.status === 'success' && Array.isArray(response.data))
        return response.data;
      if (Array.isArray(response?.data)) return response.data;
      return [];
    })
    .catch(() => []);
};

// Get recent device measurements
export const getRecentMeasurements = async (params) => {
  return publicApi
    .get(DEVICE_READINGS_RECENT_URL, { params })
    .then((response) => response.data)
    .catch(() => ({}));
};

// Generate site and device IDs for a grid
export const generateSiteAndDeviceIds = async (grid_id) => {
  if (!grid_id) {
    return Promise.reject(new Error('Grid ID is required'));
  }

  return publicApi
    .get(`${GENERATE_SITE_AND_DEVICE_IDS}/${grid_id}/generate`)
    .then((response) => response.data)
    .catch(() => ({}));
};
