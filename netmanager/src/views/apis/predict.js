import axios from "axios";
import constants from "../../config/constants";

export const heatmapPredictApi = async (locationData) => {
  return await axios
    .post(constants.GET_HEATMAP_DATA, locationData)
    .then((response) => response.data);
};
