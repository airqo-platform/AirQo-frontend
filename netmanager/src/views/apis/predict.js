import axios from 'axios';
import { GET_HEATMAP_DATA } from 'config/urls/predict';

axios.defaults.headers.common.Authorization = `JWT ${process.env.REACT_APP_AUTHORIZATION_TOKEN}`;

export const heatmapPredictApi = async () => {
  return await axios.get(GET_HEATMAP_DATA).then((response) => response.data);
};
