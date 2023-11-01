import { GET_MONITORING_SITES_LOCATIONS_URI } from 'config/urls/analytics';
import { ALL_LOCATIONS_URI } from 'config/urls/locationRegistry';
import createAxiosInstance from './axiosConfig';

export const getMonitoringSitesLocationsApi = async () => {
  setAuthentication(false);
  return await createAxiosInstance()
    .get(GET_MONITORING_SITES_LOCATIONS_URI)
    .then((response) => response.data);
};

export const getAllLocationsApi = async () => {
  return await createAxiosInstance()
    .get(ALL_LOCATIONS_URI)
    .then((response) => response.data);
};
