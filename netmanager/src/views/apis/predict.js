import axios from "axios";
import { GET_HEATMAP_DATA } from "config/urls/predict";

export const heatmapPredictApi = async () => {
  return await axios.get(GET_HEATMAP_DATA).then((response) => response.data);
};
