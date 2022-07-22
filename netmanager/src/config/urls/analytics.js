import { stripTrailingSlash } from "../utils";

const BASE_ANALYTICS_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_ANALYTICS_URL || process.env.REACT_APP_BASE_URL
);

export const GENERATE_CUSTOMISABLE_CHARTS_URI = `${BASE_ANALYTICS_URL}/analytics/dashboard/chart/data`;

export const DAILY_MEAN_AVERAGES_URI = `${BASE_ANALYTICS_URL}/analytics/dashboard/historical/daily-averages`;

export const DOWNLOAD_CUSTOMISED_DATA_URI = `${BASE_ANALYTICS_URL}/analytics/data/download`;

export const D3_CHART_DATA_URI = `${BASE_ANALYTICS_URL}/analytics/dashboard/chart/d3/data`;

export const EXCEEDANCES_URI = `${BASE_ANALYTICS_URL}/analytics/dashboard/exceedances`;

export const GET_SITES = `${BASE_ANALYTICS_URL}/analytics/dashboard/sites`;

// pending verification
export const GET_MONITORING_SITES_LOCATIONS_URI = `${BASE_ANALYTICS_URL}/analytics/dashboard/monitoringsites/locations?organisation_name=KCCA`;

export const DOWNLOAD_DATA = `${BASE_ANALYTICS_URL}/analytics/data/download?type=`;

export const GET_MONITORING_SITES_URI = `${BASE_ANALYTICS_URL}/analytics/dashboard/monitoringsites?organisation_name=KCCA`;

export const GET_DATA_MAP = `${BASE_ANALYTICS_URL}/analytics/dashboard/monitoringsites?organisation_name=KCCA&pm25_category=`;

export const URBAN_BETTER_DOWNLOAD_DATA_URI = `${BASE_ANALYTICS_URL}/analytics/data/download?tenant=urbanbetter`;