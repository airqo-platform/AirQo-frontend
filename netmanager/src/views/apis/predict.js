import axios from "axios";

export const heatmapPredictApi = async (locationData) => {
  return await axios
    .post("http://127.0.0.1:3000/api/v1/predict/heatmap", locationData)
    .then((response) => response.data);
};
