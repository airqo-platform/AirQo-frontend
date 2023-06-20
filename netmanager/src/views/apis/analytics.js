import axios from 'axios';
import {
  GET_DATA_MAP,
  GET_SITES,
  DOWNLOAD_CUSTOMISED_DATA_URI,
  D3_CHART_DATA_URI,
  SCHEDULE_EXPORT_DATA
} from 'config/urls/analytics';

let token = localStorage.jwtToken;
if (token) {
  axios.defaults.headers.common.Authorization = token;
} else {
  axios.defaults.headers.common.Authorization = `JWT ${process.env.REACT_APP_AUTHORIZATION_TOKEN}`;
}

export const getMonitoringSitesInfoApi = async (pm25Category) => {
  return await axios.get(GET_DATA_MAP + pm25Category).then((response) => response.data);
};

export const getSitesApi = async () => {
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
