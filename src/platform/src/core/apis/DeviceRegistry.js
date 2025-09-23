import { secureApiProxy, AUTH_TYPES } from '../utils/secureApiProxyClient';
import {
  SITES_URL,
  READINGS_URL,
  DEVICES,
  MOBILE_DEVICES_URL,
  BAM_DEVICES_URL,
  LOWCOST_DEVICES_URL,
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

// Get site summary details with API token auth and pagination support
export const getSiteSummaryDetailsWithToken = (
  token,
  { skip = 0, limit = 30 } = {},
) => {
  // Sanitize pagination parameters
  const sanitizedSkip = Math.max(0, parseInt(skip, 10) || 0);
  const sanitizedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 30));

  const params = { skip: sanitizedSkip, limit: sanitizedLimit };
  const config = { params };

  // Only add Authorization header when token is truthy
  if (token) {
    config.headers = {
      'X-Auth-Type': AUTH_TYPES.API_TOKEN,
      Authorization: `Bearer ${token}`,
    };
  }

  return secureApiProxy
    .get(`${SITES_URL}/summary`, config)
    .then((response) => response.data);
};

export const getGridsSummaryDetails = () =>
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

export const getMapReadings = (abortSignal = null) => {
  const config = {
    authType: AUTH_TYPES.API_TOKEN,
  };

  // Add abort signal if provided and still valid
  if (abortSignal && !abortSignal.aborted) {
    config.signal = abortSignal;
  }

  return secureApiProxy
    .get(READINGS_URL, config)
    .then((response) => response.data)
    .catch((error) => {
      // Handle abort errors gracefully
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        throw new Error('Request cancelled');
      }
      // Re-throw other errors
      throw error;
    });
};

export const getNearestSite = (params) =>
  secureApiProxy
    .get(NEAREST_SITE_URL, {
      params,
      authType: AUTH_TYPES.NONE,
    })
    .then((response) => response.data);

// Get sites assigned to a specific grid
export const getAssignedSitesForGrid = (gridID) =>
  secureApiProxy
    .get(`${GRID_LOCATIONS_URL}/${gridID}/assigned-sites`, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const getGridsSummaryApi = () =>
  secureApiProxy
    .get(`${DEVICES}/grids/summary`, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

// Mobile devices endpoints
export const getMobileDevices = ({ skip = 0, limit = 30 } = {}) =>
  secureApiProxy
    .get(MOBILE_DEVICES_URL, {
      params: { skip, limit },
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

// BAM devices endpoints
export const getBAMDevices = ({ skip = 0, limit = 30 } = {}) => {
  // Sanitize pagination parameters
  const sanitizedSkip = Math.max(0, parseInt(skip, 10) || 0);
  const sanitizedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 30));

  return secureApiProxy
    .get(BAM_DEVICES_URL, {
      params: { skip: sanitizedSkip, limit: sanitizedLimit },
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);
};

// LowCost devices endpoints
export const getLowCostDevices = ({ skip = 0, limit = 30 } = {}) => {
  // Sanitize pagination parameters
  const sanitizedSkip = Math.max(0, parseInt(skip, 10) || 0);
  const sanitizedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 30));

  return secureApiProxy
    .get(LOWCOST_DEVICES_URL, {
      params: { skip: sanitizedSkip, limit: sanitizedLimit },
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);
};
