import { stripTrailingSlash } from '../utils/strings';

const BASE_DEVICE_REGISTRY_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_BASE_AIRQLOUDS_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL,
);

export const AIRQLOUDS = `${BASE_DEVICE_REGISTRY_URL}/devices/airqlouds`;

export const REFRESH_AIRQLOUD = `${BASE_DEVICE_REGISTRY_URL}/devices/airqlouds/refresh`;
