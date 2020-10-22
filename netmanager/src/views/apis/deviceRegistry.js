import axios from "axios";
import constants from "../../config/constants";

export const getAllDevicesApi = async () => {
  return await axios
    .get(constants.ALL_DEVICES_URI)
    .then((response) => response.data);
};

export const createDeviceComponentApi = async (deviceName, componentType, data) => {
  const ctype = componentType
  return await axios
      .post(constants.ADD_COMPONENT_URI + deviceName, data, { params: { ctype }})
      .then((response) => response.data)
}

export const getFilteredDevicesApi = async (params) => {
  return await axios
    .get(constants.ALL_DEVICES_URI, { params })
    .then((response) => response.data);
};

export const getDeviceUptimeByChannelIdApi = async (channelId) => {
  return await axios
    .get(constants.GET_DEVICE_UPTIME+channelId)
    .then((response) => response.data);
};
