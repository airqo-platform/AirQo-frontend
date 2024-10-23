import { DAILY_PREDICTIONS_URL, SATELLITE_PREDICTIONS_URL } from '../urls/predict';
import createAxiosInstance from './axiosConfig';

export const dailyPredictionsApi = async (siteID) => {
  return await createAxiosInstance(false)
    .get(DAILY_PREDICTIONS_URL, { params: { site_id: siteID } })
    .then((response) => response.data);
};

// satellite predictions api it takes in a body
export const satellitePredictionsApi = async (body) => {
  return await createAxiosInstance(false)
    .post(SATELLITE_PREDICTIONS_URL, body)
    .then((response) => response.data);
};
