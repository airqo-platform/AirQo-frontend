import axios from "axios";
import constants from "config/constants";

export const getMonitoringSitesInfoApi = async (pm25Category) => {
  return await axios
    .get(constants.GET_DATA_MAP + pm25Category)
    .then((response) => response.data);
};
