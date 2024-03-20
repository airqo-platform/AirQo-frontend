import { GET_HEATMAP_DATA, GET_GEOCOORDINATES_DATA, GET_FAULTS } from 'config/urls/predict';
import createAxiosInstance from './axiosConfig';

export const heatmapPredictApi = async () => {
  let allHeatMapData = [];
  let page = 1;
  let response;
  let MAX_PAGES;
  do {
    try {
      response = await createAxiosInstance().get(GET_HEATMAP_DATA, { params: { page: page } });
      MAX_PAGES = response.data.pages;
      allHeatMapData.push(response);
      page++;
    } catch (error) {
      console.error(error);
      break;
    }
  } while (page <= MAX_PAGES);
  return allHeatMapData;
};

export const geocoordinatesPredictApi = async (params) => {
  return await createAxiosInstance()
    .get(GET_GEOCOORDINATES_DATA, { params })
    .then((response) => response.data);
};

export const faultsPredictApi = async () => {
  return await createAxiosInstance(true)
    .get(GET_FAULTS)
    .then((response) => response.data);
};
