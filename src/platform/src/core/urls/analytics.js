import { NEXT_PUBLIC_API_BASE_URL } from '../../lib/envConstants';
import { stripTrailingSlash } from '../utils/strings';

const BASE_AUTH_URL = stripTrailingSlash(NEXT_PUBLIC_API_BASE_URL);

export const DATA_EXPORT_URL = `${BASE_AUTH_URL}/analytics/data-download`;
export const SHARE_REPORT_URL = `${BASE_AUTH_URL}/users/emailReport`;
export const SITES_SUMMARY_URL = `${BASE_AUTH_URL}/devices/sites/summary`;
export const DEVICE_SUMMARY_URL = `${BASE_AUTH_URL}/devices/summary`;
export const GRID_SUMMARY_URL = `${BASE_AUTH_URL}/devices/grids/summary`;
export const ANALYTICS_URL = `${BASE_AUTH_URL}/analytics/dashboard/chart/d3/data`;
export const DEVICE_READINGS_RECENT_URL = `${BASE_AUTH_URL}/devices/readings/recent`;

export const GENERATE_SITE_AND_DEVICE_IDS = `${BASE_AUTH_URL}/devices/grids`;
