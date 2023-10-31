import { stripTrailingSlash } from '../utils/strings';

const BASE_DEVICE_REGISTRY_URL = stripTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL);

export const DEVICES = `${BASE_DEVICE_REGISTRY_URL}/devices`;

export const SITES_URL = `${BASE_DEVICE_REGISTRY_URL}/devices/sites`;

export const ANALYTICS_URL = `${BASE_DEVICE_REGISTRY_URL}/analytics/dashboard/chart/d3/data`;
