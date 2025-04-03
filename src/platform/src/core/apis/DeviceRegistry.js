import { api, publicApi } from '../utils/apiClient';
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
  api.get(GRID_LOCATIONS_URL).then((response) => response.data);

export const getGridLocationDetails = (gridID) =>
  api.get(`${GRID_LOCATIONS_URL}/${gridID}`).then((response) => response.data);

// Sites endpoints
export const getSiteSummaryDetails = () =>
  api.get(`${SITES_URL}/summary`).then((response) => response.data);

export const getGirdsSummaryDetails = () =>
  api.get(GRIDS_SUMMARY_URL).then((response) => response.data);

// Devices endpoints
export const verifyCohortID = (cohortID) =>
  publicApi
    .get(`${DEVICES}/cohorts/verify/${cohortID}`)
    .then((response) => response.data);

export const updateCohortDetails = (body, cohortID) =>
  api
    .put(`${DEVICES}/cohorts/${cohortID}`, body)
    .then((response) => response.data);

export const getMapReadings = () =>
  publicApi.get(READINGS_URL).then((response) => response.data);

export const getNearestSite = (params) =>
  publicApi.get(NEAREST_SITE_URL, { params }).then((response) => response.data);

export const getGridsSummaryApi = () =>
  api.get(`${DEVICES}/grids/summary`).then((response) => response.data);
