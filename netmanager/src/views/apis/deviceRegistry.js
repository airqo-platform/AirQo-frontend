import axios from "axios";
import constants from "../../config/constants";

export const getAllDevicesApi = async () => {
  return await axios
    .get(constants.ALL_DEVICES_URI)
    .then((response) => response.data);
};

export const createDeviceComponentApi = async (
  deviceName,
  componentType,
  data
) => {
  const ctype = componentType;
  return await axios
    .post(constants.ADD_COMPONENT_URI + deviceName, data, { params: { ctype } })
    .then((response) => response.data);
};

export const getDeviceComponentsApi = async (deviceName) => {
  return await axios
    .get(constants.GET_COMPONENTS_URI + deviceName)
    .then((response) => response.data);
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
    .post(constants.DEPLOY_DEVICE_URI + "maintain", logData)
    .then((response) => response.data);
};

export const recallDeviceApi = async (recallData) => {
  return await axios
    .post(constants.DEPLOY_DEVICE_URI + "recall", recallData)
    .then((response) => response.data);
};

export const deployDeviceApi = async (deployData) => {
  return axios
    .post(constants.DEPLOY_DEVICE_URI + "deploy", deployData)
    .then((response) => response.data);
};

export const getDeviceRecentFeedByChannelIdApi = async (channelId) => {
  return await axios
    .get(constants.DEVICE_RECENT_FEEDS, { params: { channel: channelId } })
    .then((response) => response.data);
};

export const updateDeviceDetails = async (deviceName, updateData) => {
  return await axios
    .put(constants.EDIT_DEVICE_URI + deviceName, updateData)
    .then((response) => response.data);
};

export const deleteDeviceApi = async (deviceName) => {
  return axios
    .delete(constants.DELETE_DEVICE_URI, { params: { device: deviceName } })
    .then((response) => response.data);
};

export const updateMaintenanceLogApi = async (deviceId, logData) => {
  return axios
    .put(constants.UPDATE_ACTIVITY_LOG, logData, { params: { id: deviceId } })
    .then((response) => response.data);
};

export const deleteMaintenanceLogApi = (deviceId) => {
  return axios
    .delete(constants.DELETE_ACTIVITY_LOG, { params: { id: deviceId } })
    .then((response) => response.data);
};

export const updateComponentApi = async (deviceName, componentName, data) => {
  return await axios
    .put(constants.UPDATE_COMPONENT, data, {
      params: { device: deviceName, comp: componentName },
    })
    .then((response) => response.data);
};

export const deleteComponentApi = async (deviceName, componentName) => {
  return await axios
    .delete(constants.DELETE_COMPONENT, {
      params: { device: deviceName, comp: componentName },
    })
    .then((response) => response.data);
};
