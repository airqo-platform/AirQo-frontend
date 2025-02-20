import { DAILY_PREDICTIONS_URL } from '../urls/predict';
import createAxiosInstance from './axiosConfig';

export const dailyPredictionsApi = async (siteID) => {
  return await createAxiosInstance(false)
    .get(DAILY_PREDICTIONS_URL, { params: { site_id: siteID } })
    .then((response) => response.data);
};
