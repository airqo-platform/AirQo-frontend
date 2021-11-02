import axios from "axios";
import {
  GET_DATA_MAP,
  GET_SITES,
  DOWNLOAD_CUSTOMISED_DATA_URI,
  REPORTS_URL,
  REPORTS_ATTRIBUTE_DATA,
} from "config/urls/analytics";

export const getMonitoringSitesInfoApi = async (pm25Category) => {
  return await axios
    .get(GET_DATA_MAP + pm25Category)
    .then((response) => response.data);
};

export const getSitesApi = async () => {
  return await axios.get(GET_SITES).then((response) => response.data);
};

export const downloadDataApi = async (downloadType, data) => {
  return await axios
    .post(DOWNLOAD_CUSTOMISED_DATA_URI, data, { params: { downloadType } })
    .then((response) => response.data);
};

export const createReportApi = async (data) => {
  return await axios.post(REPORTS_URL, data).then((response) => response.data);
};

export const getAllReportsApi = async () => {
  return await axios.get(REPORTS_URL).then((response) => response.data);
};

export const getSingleReportApi = async (reportId) => {
  return await axios
    .get(`${REPORTS_URL}/${reportId}`)
    .then((response) => response.data);
};

export const updateReportApi = async (reportId, data) => {
  return await axios
    .patch(`${REPORTS_URL}/${reportId}`, data)
    .then((response) => response.data);
};

export const deleteReportApi = async (reportId) => {
  return await axios
    .delete(`${REPORTS_URL}/${reportId}`)
    .then((response) => response.data);
};

export const getReportAttributeDataApi = async (params, data) => {
  return await axios
    .get(REPORTS_ATTRIBUTE_DATA, { params, data })
    .then((response) => response.data);
};
