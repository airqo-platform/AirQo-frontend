import { stripTrailingSlash } from "../utils";

const BASE_ANALYTICS_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_ANALYTICS_URL || process.env.REACT_APP_BASE_URL
);

export const GENERATE_CUSTOMISABLE_CHARTS_URI = `${BASE_ANALYTICS_URL}/analytics/dashboard/customisedchart`;

export const GET_CUSTOMISABLE_CHART_INITIAL_DATA_URI = `${BASE_ANALYTICS_URL}/analytics/dashboard/customisedchart/random`;

export const GET_MONITORING_SITES_LOCATIONS_URI = `${BASE_ANALYTICS_URL}/analytics/dashboard/monitoringsites/locations?organisation_name=KCCA`;

export const GET_PM25_CATEGORY_COUNT_URI = `${BASE_ANALYTICS_URL}/analytics/dashboard/locations/pm25categorycount?organisation_name=KCCA`;

export const GET_HISTORICAL_DAILY_MEAN_AVERAGES_FOR_LAST_28_DAYS_URI = `${BASE_ANALYTICS_URL}/analytics/dashboard/historical/daily/devices`;

export const GENERATE_DEVICE_GRAPH_URI = `${BASE_ANALYTICS_URL}/analytics/device/graph`;

export const DOWNLOAD_DATA = `${BASE_ANALYTICS_URL}/analytics/data/download?type=`;

export const DOWNLOAD_CUSTOMISED_DATA_URI = `${BASE_ANALYTICS_URL}/analytics/data/download`;

export const GET_DEFAULT_REPORT_TEMPLATE_URI = `${BASE_ANALYTICS_URL}/analytics/report/get_default_report_template`;

export const SAVE_MONTHLY_REPORT_URI = `${BASE_ANALYTICS_URL}/analytics/report/save_monthly_report`;

export const GET_MONTHLY_REPORT_URI = `${BASE_ANALYTICS_URL}/analytics/report/get_monthly_report/`;

export const DELETE_MONTHLY_REPORT_URI = `${BASE_ANALYTICS_URL}/analytics/report/delete_monthly_report/`;

export const UPDATE_MONTHLY_REPORT_URI = `${BASE_ANALYTICS_URL}/analytics/report/update_monthly_report/`;

export const EXCEEDANCES_URI = `${BASE_ANALYTICS_URL}/analytics/dashboard/exceedances`;

export const GET_MONITORING_SITES_URI = `${BASE_ANALYTICS_URL}/analytics/dashboard/monitoringsites?organisation_name=KCCA`;

export const GET_DATA_MAP = `${BASE_ANALYTICS_URL}/analytics/dashboard/monitoringsites?organisation_name=KCCA&pm25_category=`;
