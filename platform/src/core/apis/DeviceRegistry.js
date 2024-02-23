import createAxiosInstance from './axiosConfig';
import {
  SITES_URL,
  ANALYTICS_URL,
  GRIDS_SUMMARY_URL,
  DEVICES,
  GRID_LOCATIONS_URL,
} from '../urls/deviceRegistry';

// Get grid locations
export const getAllGridLocationsApi = async () => {
  try {
    const response = await createAxiosInstance().get(`${GRID_LOCATIONS_URL}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get grid location details
export const getGridLocationDetails = async (gridID) => {
  try {
    const response = await createAxiosInstance().get(`${GRID_LOCATIONS_URL}/${gridID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get Sites Summary
export const getSiteSummaryDetails = async () => {
  try {
    const response = await createAxiosInstance().get(`${SITES_URL}/summary`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAnalyticsData = async (body) => {
  return await createAxiosInstance()
    .post(ANALYTICS_URL, body)
    .then((response) => response.data);
};

export const getRecentMeasurements = async (params) => {
  return await createAxiosInstance(false)
    .get(`${DEVICES}/measurements/recent`, { params })
    .then((response) => response.data);
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
