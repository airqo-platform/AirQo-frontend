import { stripTrailingSlash } from '../utils';

const BASE_ANALYTICS_URL_V2 = stripTrailingSlash(process.env.REACT_APP_BASE_URL_V2);

export const GENERATE_CUSTOMISABLE_CHARTS_URI = `${BASE_ANALYTICS_URL_V2}/analytics/dashboard/chart/data`;

export const DAILY_MEAN_AVERAGES_URI = `${BASE_ANALYTICS_URL_V2}/analytics/dashboard/historical/daily-averages`;

export const DOWNLOAD_CUSTOMISED_DATA_URI = `${BASE_ANALYTICS_URL_V2}/analytics/data-download`;

export const D3_CHART_DATA_URI = `${BASE_ANALYTICS_URL_V2}/analytics/dashboard/chart/d3/data`;

export const EXCEEDANCES_URI = `${BASE_ANALYTICS_URL_V2}/analytics/dashboard/exceedances`;

export const GET_SITES = `${BASE_ANALYTICS_URL_V2}/analytics/dashboard/sites`;

// pending verification
export const GET_MONITORING_SITES_LOCATIONS_URI = `${BASE_ANALYTICS_URL_V2}/analytics/dashboard/sites/locations?organisation_name=KCCA`;

export const DOWNLOAD_DATA = `${BASE_ANALYTICS_URL_V2}/analytics/data/download?type=`;

export const SCHEDULE_EXPORT_DATA = `${BASE_ANALYTICS_URL_V2}/analytics/data-export`;

export const GET_MONITORING_SITES_URI = `${BASE_ANALYTICS_URL_V2}/analytics/dashboard/sites?organisation_name=KCCA`;

export const GET_DATA_MAP = `${BASE_ANALYTICS_URL_V2}/analytics/dashboard/sites?organisation_name=KCCA`;

// access control
export const GET_ROLES_URI = `${BASE_ANALYTICS_URL_V2}/users/roles`;

export const GET_NETWORKS_URI = `${BASE_ANALYTICS_URL_V2}/users/networks`;

export const GET_PERMISSIONS_URI = `${BASE_ANALYTICS_URL_V2}/users/permissions`;

export const GENERATE_AIRQLOUD_DATA_SUMMARY_URI = `${BASE_ANALYTICS_URL_V2}/analytics/data/summary`;

export const GENERATE_ACCESS_TOKEN = `${BASE_ANALYTICS_URL_V2}/users/tokens`;

// Token generation and management
export const CREATE_CLIENT_URI = `${BASE_ANALYTICS_URL_V2}/users/clients`;

export const GET_CLIENTS_URI = `${BASE_ANALYTICS_URL_V2}/users/clients`;

export const GENERATE_TOKEN_URI = `${BASE_ANALYTICS_URL_V2}/users/tokens`;

// Teams
export const CREATE_TEAM_URI = `${BASE_ANALYTICS_URL_V2}/users/groups`;

// SIM
export const GET_SIM_URI = `${BASE_ANALYTICS_URL_V2}/incentives/sims`;
