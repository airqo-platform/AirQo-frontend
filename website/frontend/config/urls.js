import { stripTrailingSlash } from './utils';

const WEBSITE_BASE_URL = stripTrailingSlash(process.env.REACT_APP_WEBSITE_BASE_URL)

const BASE_AIRQLOUDS_URL = stripTrailingSlash(
    process.env.REACT_APP_BASE_AIRQLOUDS_URL || process.env.REACT_NETMANAGER_BASE_URL,
);

export const AIRQLOUD_SUMMARY = `${BASE_AIRQLOUDS_URL}/devices/airqlouds/summary?tenant=airqo`;

const BASE_NEWSLETTER_URL = stripTrailingSlash(
    process.env.REACT_APP_BASE_NEWSLETTER_URL || process.env.REACT_NETMANAGER_BASE_URL,
);

export const NEWSLETTER_SUBSCRIPTION = `${BASE_NEWSLETTER_URL}/users/newsletter/subscribe?tenant=airqo`;

// // This requires a docker config
// const BASE_INQUIRY_URL = stripTrailingSlash(
//     process.env.REACT_APP_BASE_INQUIRY_URL || process.env.REACT_NETMANAGER_BASE_URL,
// );

const BASE_INQUIRY_URL = stripTrailingSlash(process.env.REACT_NETMANAGER_BASE_URL);

export const INQUIRY_URL = `${BASE_INQUIRY_URL}/users/inquiries/register?tenant=airqo`;

const BASE_AUTH_SERVICE_URL = stripTrailingSlash(process.env.REACT_NETMANAGER_BASE_URL);

export const EXPLORE_DATA_URL = `${BASE_AUTH_SERVICE_URL}/users/candidates/register?tenant=airqo`;

// careers urls
export const CAREERS_URL = `${WEBSITE_BASE_URL}/career/`;

export const DEPARTMENTS_URL = `${WEBSITE_BASE_URL}/departments/`;

// members urls
export const TEAMS_URL = `${WEBSITE_BASE_URL}/team/`;

// netmanager url
export const NETMANAGER_URL = stripTrailingSlash(process.env.REACT_NETMANAGER_BASE_URL.replace("/api/v1/", ""));

// highlights urls
export const HIGHLIGHTS_URL = `${WEBSITE_BASE_URL}/highlights/`;

export const TAGS_URL = `${WEBSITE_BASE_URL}/tags/`;

// Partners url
export const PARTNERS_URL = `${WEBSITE_BASE_URL}/partner/`;
