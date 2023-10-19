import axios from 'axios';
import { GET_MONITORING_SITES_LOCATIONS_URI } from 'config/urls/analytics';
import { ALL_LOCATIONS_URI } from 'config/urls/locationRegistry';

const jwtToken = localStorage.getItem('jwtToken');

export const getMonitoringSitesLocationsApi = async () => {
  axios.defaults.headers.common.Authorization = jwtToken;
  return await axios.get(GET_MONITORING_SITES_LOCATIONS_URI).then((response) => response.data);
};

export const getAllLocationsApi = async () => {
  axios.defaults.headers.common.Authorization = jwtToken;
  return await axios.get(ALL_LOCATIONS_URI).then((response) => response.data);
};
