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
};

export const getDeviceComponentsApi = async (deviceName) => {
  return await axios
      .get(constants.GET_COMPONENTS_URI + deviceName)
      .then(response => response.data)
};

export const getFilteredDevicesApi = async (params) => {
  return await axios
    .get(constants.ALL_DEVICES_URI, { params })
    .then((response) => response.data);
};

export const getDeviceMaintenanceLogsApi = async (deviceName) => {
  return await axios
    .get(constants.DEVICE_MAINTENANCE_LOG_URI + deviceName)
    .then((response) => response.data);
};

export const addMaintenanceLogApi = async (logData) => {
  return await axios
      .post(constants.DEPLOY_DEVICE_URI + 'maintain', logData)
      .then(response => response.data);
};

export const getDeviceRecentFeedByChannelIdApi = async (channelId) => {
  return await axios
      .get(constants.DEVICE_RECENT_FEEDS, { params: { channel: channelId } })
      .then(response => response.data);
};
