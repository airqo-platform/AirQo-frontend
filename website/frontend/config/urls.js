import { stripTrailingSlash } from './utils';

const BASE_AIRQLOUDS_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_AIRQLOUDS_URL || process.env.REACT_NETMANAGER_BASE_URL,
);

export const AIRQLOUD_SUMMARY = `${BASE_AIRQLOUDS_URL}/devices/airqlouds/summary?tenant=airqo`;
