import { stripTrailingSlash } from '../utils/strings';

const BASE_DEVICE_REGISTRY_URL = stripTrailingSlash(
  process.env.NEXT_APP_BASE_DEVICE_REGISTRY_URL ||
    process.env.NEXT_APP_BASE_URL,
);

export const AIRQLOUDS = `${BASE_DEVICE_REGISTRY_URL}/devices/airqlouds`;

export const REFRESH_AIRQLOUD = `${BASE_DEVICE_REGISTRY_URL}/devices/airqlouds/refresh`;
