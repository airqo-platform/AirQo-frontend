import axios from 'axios';
import { GET_HEATMAP_DATA, GET_GEOCOORDINATES_DATA, GET_FAULTS } from 'config/urls/predict';

const jwtToken = localStorage.getItem('jwtToken');

export const heatmapPredictApi = async () => {
  let allHeatMapData = [];
  let page = 1;
  let response;
  let MAX_PAGES;
  do {
    try {
      axios.defaults.headers.common.Authorization = jwtToken;
      response = await axios.get(GET_HEATMAP_DATA);
      MAX_PAGES = response.data.pages;
      allHeatMapData.push(axios.get(`${GET_HEATMAP_DATA}?page=${page}`));
      let resolvedPromises = await Promise.all(allHeatMapData);
      for (let i = 0; i < resolvedPromises.length; i++) {
        allHeatMapData = resolvedPromises[i];
      }
      page++;
    } catch (error) {
      break;
    }
  } while (page <= MAX_PAGES);
  return allHeatMapData;
};

export const geocoordinatesPredictApi = async (params) => {
  axios.defaults.headers.common.Authorization = jwtToken;
  return await axios.get(GET_GEOCOORDINATES_DATA, { params }).then((response) => response.data);
};

export const faultsPredictApi = async () => {
  return await axios
    .get(GET_FAULTS, {
      params: { token: API_TOKEN }
    })
    .then((response) => response.data);
};
