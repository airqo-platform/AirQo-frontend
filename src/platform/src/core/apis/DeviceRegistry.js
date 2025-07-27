import { secureApiProxy, AUTH_TYPES } from '../utils/secureApiProxyClient';
import {
  SITES_URL,
  READINGS_URL,
  DEVICES,
  GRID_LOCATIONS_URL,
  NEAREST_SITE_URL,
  GRIDS_SUMMARY_URL,
} from '../urls/deviceRegistry';

// Grid locations endpoints
export const getAllGridLocationsApi = () =>
  secureApiProxy
    .get(GRID_LOCATIONS_URL, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const getGridLocationDetails = (gridID) =>
  secureApiProxy
    .get(`${GRID_LOCATIONS_URL}/${gridID}`, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

// Sites endpoints
export const getSiteSummaryDetails = () =>
  secureApiProxy
    .get(`${SITES_URL}/summary`, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

// Get site summary details with API token auth
export const getSiteSummaryDetailsWithToken = () =>
  secureApiProxy
    .get(`${SITES_URL}/summary`, {
      authType: AUTH_TYPES.API_TOKEN,
    })
    .then((response) => response.data);

export const getGirdsSummaryDetails = () =>
  secureApiProxy
    .get(GRIDS_SUMMARY_URL, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

// Devices endpoints
export const verifyCohortID = (cohortID) =>
  secureApiProxy
    .get(`${DEVICES}/cohorts/verify/${cohortID}`, {
      authType: AUTH_TYPES.NONE,
    })
    .then((response) => response.data);

export const updateCohortDetails = (body, cohortID) =>
  secureApiProxy
    .put(`${DEVICES}/cohorts/${cohortID}`, body, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const getMapReadings = () =>
  secureApiProxy
    .get(READINGS_URL, {
      authType: AUTH_TYPES.API_TOKEN,
    })
    .then((response) => response.data);

export const getNearestSite = (params) =>
  secureApiProxy
    .get(NEAREST_SITE_URL, {
      params,
      authType: AUTH_TYPES.NONE,
    })
    .then((response) => response.data);

export const getGridsSummaryApi = () =>
  secureApiProxy
    .get(`${DEVICES}/grids/summary`, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);
