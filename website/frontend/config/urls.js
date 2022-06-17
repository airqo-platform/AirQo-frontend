import { stripTrailingSlash } from './utils';

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
