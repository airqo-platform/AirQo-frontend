import { stripTrailingSlash } from "../utils";

const BASE_DEVICE_REGISTRY_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_DEVICE_REGISTRY_URL ||
    process.env.REACT_APP_BASE_URL
);

export const ACTIVITY_URI = `${BASE_DEVICE_REGISTRY_URL}/devices/activities`;

export const REGISTER_DEVICE_URI = `${BASE_DEVICE_REGISTRY_URL}/devices/ts`;

export const ALL_DEVICES_URI = `${BASE_DEVICE_REGISTRY_URL}/devices`;

export const EDIT_DEVICE_URI = `${BASE_DEVICE_REGISTRY_URL}/devices`;

export const DEVICES_IN_LOCATION_URI = `${BASE_DEVICE_REGISTRY_URL}/devices/by/location?loc=`;

export const DEPLOY_DEVICE_URI = `${BASE_DEVICE_REGISTRY_URL}/devices/activities/deploy`;

export const ADD_MAINTENANCE_LOGS_URI = `${BASE_DEVICE_REGISTRY_URL}/devices/activities/maintain`;

export const DELETE_DEVICE_URI = `${BASE_DEVICE_REGISTRY_URL}/devices/ts/delete`;

export const ADD_COMPONENT_URI = `${BASE_DEVICE_REGISTRY_URL}/devices/add/components?device=`;

export const GET_COMPONENTS_URI = `${BASE_DEVICE_REGISTRY_URL}/devices/list/components?device=`;

export const DELETE_COMPONENT_URI = `${BASE_DEVICE_REGISTRY_URL}/devices/delete/components?comp=`;

export const UPDATE_COMPONENT_URI = `${BASE_DEVICE_REGISTRY_URL}/devices/update/components?device=`;

export const UPDATE_COMPONENT = `${BASE_DEVICE_REGISTRY_URL}/devices/update/components`;

export const DELETE_COMPONENT = `${BASE_DEVICE_REGISTRY_URL}/devices/delete/components`;

export const DELETE_DEVICE_PHOTO = `${BASE_DEVICE_REGISTRY_URL}/devices/photos`;

export const RECALL_DEVICE_URI = `${BASE_DEVICE_REGISTRY_URL}/devices/activities/recall`;

export const EVENTS = `${BASE_DEVICE_REGISTRY_URL}/devices/events`;

export const SITES = `${BASE_DEVICE_REGISTRY_URL}/devices/sites`;
