import axios from 'axios';
import { GET_HEATMAP_DATA, GET_GEOCOORDINATES_DATA } from 'config/urls/predict';
import { isEmpty } from 'validate.js';

const jwtToken = localStorage.getItem('jwtToken');
axios.defaults.headers.common.Authorization = jwtToken;

const API_TOKEN = process.env.REACT_APP_API_TOKEN;

export const heatmapPredictApi = async () => {
  let allHeatMapData = [];
  let page = 1;
  let response;
  let MAX_PAGES;
  do {
    try {
      response = await axios.get(GET_HEATMAP_DATA, {
        params: {
          token: API_TOKEN
        }
      });
      MAX_PAGES = response.data.pages;
      allHeatMapData.push(
        axios.get(`${GET_HEATMAP_DATA}?page=${page}`, {
          params: {
            token: API_TOKEN
          }
        })
      );
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
  return await axios.get(GET_GEOCOORDINATES_DATA, { params }).then((response) => response.data);
};
