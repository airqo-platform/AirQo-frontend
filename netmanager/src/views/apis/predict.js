import axios from 'axios';
import { GET_HEATMAP_DATA, GET_GEOCOORDINATES_DATA } from 'config/urls/predict';

const jwtToken = localStorage.getItem('jwtToken');
const token = process.env.REACT_APP_AUTH_TOKEN;

export const heatmapPredictApi = async () => {
  let allHeatMapData = [];
  let page = 1;
  let response;
  let MAX_PAGES;
  do {
    try {
      axios.defaults.headers.common.Authorization = jwtToken;
      response = await axios.get(GET_HEATMAP_DATA, { params: { page: page, token: token } });
      MAX_PAGES = response.data.pages;
      allHeatMapData.push(response.data);
      page++;
    } catch (error) {
      console.error(error);
      break;
    }
  } while (page <= MAX_PAGES);
  return allHeatMapData;
};

export const geocoordinatesPredictApi = async (params) => {
  axios.defaults.headers.common.Authorization = jwtToken;
  return await axios.get(GET_GEOCOORDINATES_DATA, { params }).then((response) => response.data);
};
