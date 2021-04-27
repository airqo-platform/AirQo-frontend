import { stripTrailingSlash } from "../utils";

const BASE_LOCATION_REGISTRY_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_LOCATION_REGISTRY_URL ||
    process.env.REACT_APP_BASE_URL
);

export const ALL_LOCATIONS_URI = `${BASE_LOCATION_REGISTRY_URL}/location_registry/locations`;

export const CREATE_ID_URI = `${BASE_LOCATION_REGISTRY_URL}/location_registry/create_id`;

export const REGISTER_LOCATION_URI = `${BASE_LOCATION_REGISTRY_URL}/location_registry/register`;

export const VIEW_LOCATION_URI = `${BASE_LOCATION_REGISTRY_URL}/location_registry/location?loc_ref=`;

export const EDIT_LOCATION_DETAILS_URI = `${BASE_LOCATION_REGISTRY_URL}/location_registry/edit?loc_ref=`;

export const UPDATE_LOCATION_URI = `${BASE_LOCATION_REGISTRY_URL}/location_registry/update`;
