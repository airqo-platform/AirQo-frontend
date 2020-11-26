import axios from "axios";
import constants from "../../config/constants";

export const heatmapPredictApi = async () => {
  return await axios
    .get(constants.GET_HEATMAP_DATA)
    .then((response) => response.data);
};
