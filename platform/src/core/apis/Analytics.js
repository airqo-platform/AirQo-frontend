import createAxiosInstance from './axiosConfig';
import {
  DATA_EXPORT_URL,
  SHARE_REPORT_URL,
  SITES_SUMMARY_URL,
} from '../urls/analytics';

export const exportDataApi = async (body) => {
  return await createAxiosInstance()
    .post(DATA_EXPORT_URL, body)
    .then((response) => response);
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
export const getSitesSummaryApi = async ({ signal, timeout = 150000 }) => {
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
