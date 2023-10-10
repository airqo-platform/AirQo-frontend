import axios from 'axios';
import { GET_MONITORING_SITES_LOCATIONS_URI } from 'config/urls/analytics';
import { ALL_LOCATIONS_URI } from 'config/urls/locationRegistry';
import { isEmpty } from 'validate.js';

const jwtToken = localStorage.getItem('jwtToken');
axios.defaults.headers.common.Authorization = jwtToken;

export const getMonitoringSitesLocationsApi = async () => {
  return await axios.get(GET_MONITORING_SITES_LOCATIONS_URI).then((response) => response.data);
};

export const getAllLocationsApi = async () => {
  return await axios.get(ALL_LOCATIONS_URI).then((response) => response.data);
};
