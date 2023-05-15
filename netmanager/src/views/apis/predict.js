import axios from 'axios';
import { GET_HEATMAP_DATA } from 'config/urls/predict';

let token = localStorage.jwtToken;
if (token) {
  axios.defaults.headers.common.Authorization = token;
} else {
  axios.defaults.headers.common.Authorization = `JWT ${process.env.REACT_APP_AUTHORIZATION_TOKEN}`;
}

export const heatmapPredictApi = async () => {
  return await axios.get(GET_HEATMAP_DATA).then((response) => response.data);
};
