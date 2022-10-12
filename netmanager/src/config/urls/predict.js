import { stripTrailingSlash } from "../utils";

const BASE_PREDICT_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_PREDICT_URL || process.env.REACT_APP_BASE_URL
);

export const GET_HEATMAP_DATA = `${BASE_PREDICT_URL}/predict/heatmap`;
