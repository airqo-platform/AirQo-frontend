import createAxiosInstance from './axiosConfig';
import {
  SITES_URL,
  ANALYTICS_URL,
  READINGS_URL,
  DEVICES,
  GRID_LOCATIONS_URL,
  NEAREST_SITE_URL,
  GRIDS_SUMMARY_URL,
} from '../urls/deviceRegistry';

// Get grid locations
export const getAllGridLocationsApi = async () => {
  const response = await createAxiosInstance().get(`${GRID_LOCATIONS_URL}`);
  return response.data;
};

// Get grid location details
export const getGridLocationDetails = async (gridID) => {
  const response = await createAxiosInstance().get(
    `${GRID_LOCATIONS_URL}/${gridID}`,
  );
  return response.data;
};

// Get Sites Summary
export const getSiteSummaryDetails = async () => {
  const response = await createAxiosInstance().get(`${SITES_URL}/summary`);
  return response.data;
};

export const getGirdsSummaryDetails = async () => {
  const response = await createAxiosInstance().get(`${GRIDS_SUMMARY_URL}`);
  return response.data;
};

export const getAnalyticsData = async ({ body, timeout = 150000, signal }) => {
  try {
    const response = await createAxiosInstance().post(ANALYTICS_URL, body, {
      timeout: timeout,
      signal,
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Analytics request timed out. Please try again.');
    }
    if (error.name === 'CanceledError') {
      console.log('Analytics request was canceled.');
      return; // or handle as needed
    }
    throw error;
  }
};

export const getRecentMeasurements = async ({
  params,
  timeout = 150000,
  signal,
}) => {
  try {
    const response = await createAxiosInstance(false).get(
      `${DEVICES}/readings/recent`,
      {
        params,
        timeout: timeout,
        signal,
      },
    );
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error(
        'Recent measurements request timed out. Please try again.',
      );
    }
    if (error.name === 'CanceledError') {
      console.log('Recent measurements request was canceled.');
      return; // or handle as needed
    }
    throw error;
  }
};

export const verifyCohortID = async (cohortID) => {
  return await createAxiosInstance(false)
    .get(`${DEVICES}/cohorts/verify/${cohortID}`)
    .then((response) => response.data);
};

export const updateCohortDetails = async (body, cohortID) => {
  return await createAxiosInstance()
    .put(`${DEVICES}/cohorts/${cohortID}`, body)
    .then((response) => response.data);
};

export const getMapReadings = async () => {
  return await createAxiosInstance(false)
    .get(READINGS_URL)
    .then((response) => response.data);
};

export const getNearestSite = async (params) => {
  return await createAxiosInstance(false)
    .get(NEAREST_SITE_URL, { params })
    .then((response) => response.data);
};

export const getGridsSummaryApi = async () => {
  return await createAxiosInstance()
    .get(`${DEVICES}/grids/summary`)
    .then((response) => response.data);
};
