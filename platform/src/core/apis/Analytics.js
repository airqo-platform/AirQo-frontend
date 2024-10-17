import createAxiosInstance from './axiosConfig';
import {
  DATA_EXPORT_URL,
  SHARE_REPORT_URL,
  SITES_SUMMARY_URL,
  REPLACE_PREFERENCES_URL,
} from '../urls/analytics';

export const exportDataApi = async (body) => {
  return await createAxiosInstance()
    .post(DATA_EXPORT_URL, body)
    .then((response) => response.data);
};

export const shareReportApi = async (body) => {
  try {
    return await createAxiosInstance()
      .post(SHARE_REPORT_URL, body)
      .then((response) => response.data);
  } catch (error) {
    console.log(error);
  }
};

// Getting site summary data
export const getSitesSummaryApi = async ({ signal, timeout = 110000 }) => {
  try {
    const response = await createAxiosInstance().get(SITES_SUMMARY_URL, {
      signal,
      timeout,
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
      throw new Error('Request timed out. Please try again.');
    } else if (error.name === 'AbortError') {
      console.log('Request was aborted');
      throw error;
    } else {
      console.error('Error fetching sites summary:', error);
      throw error;
    }
  }
};

// Replacing user selected sites api
export const replaceUserSelectedSitesApi = async (body) => {
  return await createAxiosInstance()
    .put(REPLACE_PREFERENCES_URL, body)
    .then((response) => response.data);
};
