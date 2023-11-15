import createAxiosInstance from './axiosConfig';
import { SITES_URL, ANALYTICS_URL, GRIDS_URL, DEVICES } from '../urls/deviceRegistry';

export const getAllGridLocationsApi = async () => {
  try {
    const response = await createAxiosInstance().get(`${GRIDS_URL}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSiteSummaryDetails = async () => {
  return await createAxiosInstance()
    .get(`${SITES_URL}/summary`)
    .then((response) => response.data);
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
