import { stripTrailingSlash } from './utils';

const BASE_AIRQLOUDS_URL = stripTrailingSlash("https://staging-platform.airqo.net/api/v1/");

export const AIRQLOUD_SUMMARY = `${BASE_AIRQLOUDS_URL}/devices/airqlouds/summary?tenant=airqo`;

const BASE_NEWSLETTER_URL = stripTrailingSlash("https://staging-platform.airqo.net/api/v1/");

export const NEWSLETTER_SUBSCRIPTION = `${BASE_NEWSLETTER_URL}/users/newsletter/subscribe?tenant=airqo`;
