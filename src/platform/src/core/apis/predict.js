import { secureApiProxy, AUTH_TYPES } from '../utils/secureApiProxyClient';
import { DAILY_PREDICTIONS_URL } from '../urls/predict';

// Get daily predictions for a site
export const dailyPredictionsApi = (siteID) =>
  secureApiProxy
    .get(DAILY_PREDICTIONS_URL, {
      params: { site_id: siteID },
      authType: AUTH_TYPES.API_TOKEN,
    })
    .then((response) => response.data);
