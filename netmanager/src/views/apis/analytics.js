import axios from "axios";
import { GET_DATA_MAP } from "config/urls/analytics";

export const getMonitoringSitesInfoApi = async (pm25Category) => {
  return await axios
    .get(GET_DATA_MAP + pm25Category)
    .then((response) => response.data);
};
