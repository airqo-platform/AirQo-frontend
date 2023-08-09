import axios from 'axios';
import {
  ACTIVITY_URI,
  ALL_DEVICES_URI,
  ADD_MAINTENANCE_LOGS_URI,
  DEPLOY_DEVICE_URI,
  EDIT_DEVICE_URI,
  DELETE_DEVICE_URI,
  DELETE_DEVICE_PHOTO,
  EVENTS,
  RECALL_DEVICE_URI,
  SITES,
  AIRQLOUDS,
  DECRYPT,
  QRCODE,
  REFRESH_AIRQLOUD,
  SOFT_EDIT_DEVICE_URI,
  DASHBOARD_AIRQLOUDS
} from 'config/urls/deviceRegistry';
import { DEVICE_MAINTENANCE_LOG_URI } from 'config/urls/deviceMonitoring';
import { DEVICE_RECENT_FEEDS } from 'config/urls/dataManagement';
import { GET_DEVICE_IMAGES, SOFT_EDIT_DEVICE_IMAGE } from '../../config/urls/deviceRegistry';
import { BASE_AUTH_TOKEN } from '../../utils/envVariables';

export const getAllDevicesApi = async (networkID) => {
  return await axios
    .get(ALL_DEVICES_URI, { params: { network: networkID, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const softCreateDeviceApi = async (data, ctype) => {
  return await axios
    .post(SOFT_EDIT_DEVICE_URI, data, { params: { ctype, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getFilteredDevicesApi = async (params) => {
  return await axios
    .get(ALL_DEVICES_URI, { params: { ...params, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getDeviceMaintenanceLogsApi = async (deviceName) => {
  return await axios
    .get(DEVICE_MAINTENANCE_LOG_URI + deviceName, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getActivitiesApi = async (params) => {
  return await axios
    .get(ACTIVITY_URI, { params: { ...params, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getActivitiesSummaryApi = async (params) => {
  return await axios
    .get(ACTIVITY_URI, { params: { ...params, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const addMaintenanceLogApi = async (deviceName, logData) => {
  return await axios
    .post(ADD_MAINTENANCE_LOGS_URI, logData, { params: { deviceName, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const recallDeviceApi = async (deviceName, user) => {
  const requestData = {
    deviceName,
    user,
  };
  return await axios
    .post(RECALL_DEVICE_URI, requestData, { params: { deviceName, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const deployDeviceApi = async (deviceName, deployData) => {
  return axios
    .post(DEPLOY_DEVICE_URI, deployData, { params: { deviceName, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getDeviceRecentFeedByChannelIdApi = async (channelId) => {
  return await axios
    .get(DEVICE_RECENT_FEEDS, { params: { channel: channelId, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const updateDeviceDetails = async (id, updateData) => {
  return await axios
    .put(EDIT_DEVICE_URI, updateData, { params: { id, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const softUpdateDeviceDetails = async (deviceId, updateData) => {
  return await axios
    .put(SOFT_EDIT_DEVICE_URI, updateData, { params: { id: deviceId, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const deleteDeviceApi = async (deviceName) => {
  return axios
    .delete(DELETE_DEVICE_URI, { params: { device: deviceName, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const updateMaintenanceLogApi = async (deviceId, logData) => {
  return axios
    .put(ACTIVITY_URI, logData, { params: { id: deviceId, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const deleteMaintenanceLogApi = (deviceId) => {
  return axios
    .delete(ACTIVITY_URI, { params: { id: deviceId, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const deleteDevicePhotos = async (deviceId, urls) => {
  return await axios
    .delete(DELETE_DEVICE_PHOTO, {
      params: { id: deviceId, token: BASE_AUTH_TOKEN },
      data: { photos: urls }
    })
    .then((response) => response.data);
};

export const getEventsApi = async (params) => {
  return await axios
    .get(EVENTS, { params: { ...params, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getSitesApi = async (params) => {
  return await axios
    .get(SITES, { params: { ...params, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getSitesSummaryApi = async (params) => {
  return await axios
    .get(`${SITES}/summary`, { params: { ...params, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getSiteDetailsApi = async (site_id) => {
  return await axios
    .get(SITES, { params: { id: site_id, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const updateSiteApi = async (site_id, siteData) => {
  return await axios
    .put(SITES, siteData, { params: { id: site_id, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const createSiteApi = async (siteData) => {
  return await axios
    .post(SITES, siteData, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const deleteSiteApi = async (siteId) => {
  return await axios
    .delete(SITES, { params: { id: siteId, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getAirQloudsApi = async (params) => {
  return await axios
    .get(AIRQLOUDS, { params: { ...params, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getDashboardAirQloudsApi = async (params) => {
  return await axios
    .get(DASHBOARD_AIRQLOUDS, { params: { ...params, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const decryptKeyApi = async (encrypted_key) => {
  return await axios
    .post(DECRYPT, { encrypted_key }, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const QRCodeApi = async (params) => {
  return await axios
    .get(QRCODE, { params: { ...params, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const refreshAirQloudApi = async (params) => {
  return await axios
    .put(REFRESH_AIRQLOUD, {}, { params: { ...params, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const softCreateDevicePhoto = async (data) => {
  return await axios
    .post(SOFT_EDIT_DEVICE_IMAGE, data, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getDevicePhotos = async (params) => {
  return await axios
    .get(GET_DEVICE_IMAGES, { params: { device_id: params, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};
