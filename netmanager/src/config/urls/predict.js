import { stripTrailingSlash } from '../utils';

const BASE_PREDICT_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_PREDICT_URL || process.env.REACT_APP_BASE_URL
);

const BASE_ANALYTICS_URL_V2 = stripTrailingSlash(process.env.REACT_APP_BASE_URL_V2);

export const GET_HEATMAP_DATA = `${BASE_PREDICT_URL}/predict/heatmap`;

export const GET_GEOCOORDINATES_DATA = `${BASE_ANALYTICS_URL_V2}/predict/search`;
