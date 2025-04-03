import { publicApi } from '../utils/apiClient';
import { DAILY_PREDICTIONS_URL } from '../urls/predict';

// Get daily predictions for a site
export const dailyPredictionsApi = (siteID) =>
  publicApi
    .get(DAILY_PREDICTIONS_URL, { params: { site_id: siteID } })
    .then((response) => response.data);
