import axios from "axios";
import {
  GET_DATA_MAP,
  GET_SITES,
  DOWNLOAD_CUSTOMISED_DATA_URI,
  D3_CHART_DATA_URI,
  GET_MAP_SENSORS_DATA,
} from "config/urls/analytics";
import { URBAN_BETTER_DOWNLOAD_DATA_URI } from "../../config/urls/analytics";

export const getMonitoringSitesInfoApi = async (pm25Category) => {
  return await axios
    .get(GET_DATA_MAP + pm25Category)
    .then((response) => response.data);
};

export const getLatestAirQualityApi = async () => {
  return await axios
    .get(GET_MAP_SENSORS_DATA)
    .then((response) => response.data);
};

export const getSitesApi = async () => {
  return await axios.get(GET_SITES).then((response) => response.data);
};

export const downloadDataApi = async (downloadType, data, blobType, outputFormat) => {
  if (blobType) {
    return axios.request({
      url: DOWNLOAD_CUSTOMISED_DATA_URI,
      method: "POST",
      data: data,
      params: { downloadType, outputFormat },
      responseType: "blob", //important
    });
  }
  return axios
    .post(DOWNLOAD_CUSTOMISED_DATA_URI, data, { params: { downloadType,  outputFormat } })
    .then((response) => response.data);
};

export const loadD3ChartDataApi = async (data) => {
  return await axios
    .post(D3_CHART_DATA_URI, data)
    .then((response) => response.data);
};

export const downloadUrbanBetterDataApi = async (data) => {
  return await axios
    .post(URBAN_BETTER_DOWNLOAD_DATA_URI, data)
    .then((response) => response.data);
}