import axios from "axios";
import constants from "../../config/constants";

export const getMonitoringSitesLocationsApi = async () => {
  return await axios
    .get(constants.GET_MONITORING_SITES_LOCATIONS_URI)
    .then((response) => response.data);
};

export const getAllLocationsApi = async () => {
  return await axios
    .get(constants.ALL_LOCATIONS_URI)
    .then((response) => response.data);
};
