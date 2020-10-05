import axios from "axios";
import constants from "../../config/constants";

export const getAllDevicesApi = async () => {
  return await axios
    .get(constants.ALL_DEVICES_URI)
    .then((response) => response.data);
};
