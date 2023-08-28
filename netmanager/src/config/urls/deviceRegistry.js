import { stripTrailingSlash } from '../utils';

const BASE_DEVICE_REGISTRY_URL = stripTrailingSlash(process.env.REACT_APP_BASE_URL);

const BASE_DEVICE_REGISTRY_URL_V2 = stripTrailingSlash(process.env.REACT_APP_BASE_URL_V2);

export const ACTIVITY_URI = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/activities`;

export const REGISTER_DEVICE_URI = `${BASE_DEVICE_REGISTRY_URL_V2}/devices`;

export const ALL_DEVICES_URI = `${BASE_DEVICE_REGISTRY_URL_V2}/devices`;

export const EDIT_DEVICE_URI = `${BASE_DEVICE_REGISTRY_URL_V2}/devices`;

export const SOFT_EDIT_DEVICE_URI = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/soft`;

export const DEVICES_IN_LOCATION_URI = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/by/location?loc=`;

export const DEPLOY_DEVICE_URI = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/activities/deploy`;

export const ADD_MAINTENANCE_LOGS_URI = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/activities/maintain`;

export const DELETE_DEVICE_URI = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/ts/delete`;

export const DELETE_DEVICE_PHOTO = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/photos`;

export const RECALL_DEVICE_URI = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/activities/recall`;

export const EVENTS = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/events?tenant=airqo`;

export const SITES = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/sites`;

export const AIRQLOUDS = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/airqlouds?tenant=airqo`;

export const REFRESH_AIRQLOUD = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/airqlouds/refresh`;

export const DASHBOARD_AIRQLOUDS = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/airqlouds/dashboard`;

export const GRIDS_COHORTS_COMBINED = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/airqlouds/combined`;

export const GRIDS = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/grids`;

export const COHORTS = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/cohorts`;

export const DECRYPT = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/decrypt`;

export const QRCODE = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/qrcode`;

export const SOFT_EDIT_DEVICE_IMAGE = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/photos/soft?tenant=airqo`;

export const GET_DEVICE_IMAGES = `${BASE_DEVICE_REGISTRY_URL_V2}/devices/photos?tenant=airqo`;

export const ALL_DEVICE_HOSTS = `${BASE_DEVICE_REGISTRY_URL_V2}/incentives/hosts`;

export const CREATE_DEVICE_HOST = `${BASE_DEVICE_REGISTRY_URL_V2}/incentives/hosts`;

export const UPDATE_DEVICE_HOST = `${BASE_DEVICE_REGISTRY_URL_V2}/incentives/hosts`;

export const SEND_DEVICE_HOST_MONEY = `${BASE_DEVICE_REGISTRY_URL_V2}/incentives/transactions/hosts`;

export const GET_TRANSACTION_HISTORY = `${BASE_DEVICE_REGISTRY_URL_V2}/incentives/transactions/payments/hosts`;
