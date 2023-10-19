import axios from 'axios';
import {
  GET_DATA_MAP,
  GET_SITES,
  DOWNLOAD_CUSTOMISED_DATA_URI,
  D3_CHART_DATA_URI,
  GENERATE_AIRQLOUD_DATA_SUMMARY_URI,
  SCHEDULE_EXPORT_DATA,
  CREATE_CLIENT_URI,
  GET_CLIENTS_URI,
  GENERATE_TOKEN_URI
} from 'config/urls/analytics';
import { BASE_AUTH_TOKEN } from 'utils/envVariables';
import { isEmpty } from 'validate.js';

const jwtToken = localStorage.getItem('jwtToken');
axios.defaults.headers.common.Authorization = jwtToken;

export const getMonitoringSitesInfoApi = async (pm25Category) => {
  return await axios.get(GET_DATA_MAP + pm25Category).then((response) => response.data);
};

export const getSitesApi = async () => {
  axios.defaults.headers.common.Authorization = jwtToken;
  return await axios.get(GET_SITES).then((response) => response.data);
};

export const downloadDataApi = async (data) => {
  const headers = {
    service: 'data-export'
  };

  return axios
    .post(DOWNLOAD_CUSTOMISED_DATA_URI, data, { headers })
    .then((response) => response.data);
};

export const loadD3ChartDataApi = async (data) => {
  return await axios.post(D3_CHART_DATA_URI, data).then((response) => response.data);
};

export const scheduleExportDataApi = async (data) => {
  return await axios.post(SCHEDULE_EXPORT_DATA, data).then((response) => response.data);
};

export const refreshScheduleExportDataApi = async (requestId) => {
  return await axios
    .patch(SCHEDULE_EXPORT_DATA, { params: { requestId } })
    .then((response) => response.data);
};

export const getScheduleExportDataApi = async (USERID) => {
  return await axios
    .get(SCHEDULE_EXPORT_DATA, { params: { userId: USERID } })
    .then((response) => response.data);
};

export const generateAirQloudDataSummaryApi = async (data) => {
  return await axios
    .post(GENERATE_AIRQLOUD_DATA_SUMMARY_URI, data)
    .then((response) => response.data);
};

export const createClientApi = async (data) => {
  return await axios.post(CREATE_CLIENT_URI, data).then((response) => response.data);
};

export const getClientsApi = async () => {
  return await axios.get(GET_CLIENTS_URI).then((response) => response.data);
};

export const generateTokenApi = async (data) => {
  const response = await axios.post(GENERATE_TOKEN_URI, data);
  return response.data;
};
