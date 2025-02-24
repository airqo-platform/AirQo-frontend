import { stripTrailingSlash } from './utils';

const WEBSITE_BASE_URL = stripTrailingSlash(process.env.REACT_APP_WEBSITE_BASE_URL);
const NETMANAGER_BASE_URL = process.env.REACT_APP_NETMANAGER_URL;

const BASE_AIRQLOUDS_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_AIRQLOUDS_URL || process.env.REACT_NETMANAGER_BASE_URL
);

export const AIRQLOUD_SUMMARY = `${BASE_AIRQLOUDS_URL}/devices/grids/summary`;

const BASE_NEWSLETTER_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_NEWSLETTER_URL || process.env.REACT_NETMANAGER_BASE_URL
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
export const NETMANAGER_URL = stripTrailingSlash(NETMANAGER_BASE_URL);

// highlights urls
export const HIGHLIGHTS_URL = `${WEBSITE_BASE_URL}/highlights/`;

export const TAGS_URL = `${WEBSITE_BASE_URL}/tags/`;

// Partners url
export const PARTNERS_URL = `${WEBSITE_BASE_URL}/partner/`;

// Board Member url
export const BOARD_MEMBERS_URL = `${WEBSITE_BASE_URL}/board/`;

// Publications url
export const PUBLICATIONS_URL = `${WEBSITE_BASE_URL}/publications/`;

// Press url
export const PRESS_URL = `${WEBSITE_BASE_URL}/press/`;

// Events url
export const EVENTS_URL = `${WEBSITE_BASE_URL}/event/`;

// African Cities url
export const CITIES_URL = `${WEBSITE_BASE_URL}/african_city/`;

// Impact Number url
export const IMPACT_URL = `${WEBSITE_BASE_URL}/impact/`;

// Clean Air Network urls
export const CLEAN_AIR_URL = `${WEBSITE_BASE_URL}/cleanair_resources/`;

// clean air forum events url
export const FORUM_EVENTS_URL = `${WEBSITE_BASE_URL}/forum_events/`;
