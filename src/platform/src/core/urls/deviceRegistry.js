import { stripTrailingSlash } from '../utils/strings';

const BASE_DEVICE_REGISTRY_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_BASE_URL,
);

export const GRIDS_SUMMARY_URL = `${BASE_DEVICE_REGISTRY_URL}/devices/grids/summary`;

export const GRID_LOCATIONS_URL = `${BASE_DEVICE_REGISTRY_URL}/devices/grids`;

export const SITES_URL = `${BASE_DEVICE_REGISTRY_URL}/devices/sites`;

export const READINGS_URL = `${BASE_DEVICE_REGISTRY_URL}/devices/readings/map`;

export const NEAREST_SITE_URL = `${BASE_DEVICE_REGISTRY_URL}/devices/sites/nearest`;
