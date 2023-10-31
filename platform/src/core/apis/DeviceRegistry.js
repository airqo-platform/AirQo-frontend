import createAxiosInstance from './axiosConfig';
import { SITES_URL, ANALYTICS_URL } from '../urls/deviceRegistry';

export const getSiteSummaryDetails = async () => {
  return await createAxiosInstance(false)
    .get(`${SITES_URL}/summary`)
    .then((response) => response.data);
};

export const getAnalyticsData = async (body) => {
  return await createAxiosInstance()
    .post(ANALYTICS_URL, body)
    .then((response) => response.data);
};
