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

// Export data to file
export const exportDataApi = (body) =>
  api.post(DATA_EXPORT_URL, body).then((response) => response.data);

// Share report via email
export const shareReportApi = (body) =>
  api.post(SHARE_REPORT_URL, body).then((response) => response.data);

// Get sites summary data
export const getSitesSummaryApi = ({ group }) => {
  if (process.env.NODE_ENV === 'development') {
    // Use direct axios for proxy endpoints - no auth headers needed
    return axios
      .get('/api/proxy/sites', {
        headers: { 'Content-Type': 'application/json' },
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
export const getDeviceSummaryApi = ({ group = null }) => {
  const params = group ? { group } : {};

  if (process.env.NODE_ENV === 'development') {
    // Use direct axios for proxy endpoints - no auth headers needed
    return axios
      .get('/api/proxy/devices', {
        headers: { 'Content-Type': 'application/json' },
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
export const getGridSummaryApi = ({ admin_level = null }) => {
  const params = admin_level ? { admin_level } : {};

  if (process.env.NODE_ENV === 'development') {
    // Use direct axios for proxy endpoints - no auth headers needed
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
export const getAnalyticsDataApi = ({ body }) => {
  if (process.env.NODE_ENV === 'development') {
    // For development, use direct axios with token from localStorage
    const token = localStorage.getItem('token');

    return axios
      .post('/api/proxy/analytics', body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
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
export const getRecentMeasurements = (params) =>
  publicApi
    .get(DEVICE_READINGS_RECENT_URL, { params })
    .then((response) => response.data);

// Generate site and device IDs for a grid
export const generateSiteAndDeviceIds = (grid_id) => {
  if (!grid_id) return Promise.reject(new Error('Grid ID is required'));

  return publicApi
    .get(`${GENERATE_SITE_AND_DEVICE_IDS}/${grid_id}/generate`)
    .then((response) => response.data)
    .catch(() => ({}));
};
