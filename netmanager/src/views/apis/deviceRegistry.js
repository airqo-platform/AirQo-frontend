import axios from 'axios';
import {
  ACTIVITY_URI,
  ALL_DEVICES_URI,
  ADD_MAINTENANCE_LOGS_URI,
  ADD_COMPONENT_URI,
  GET_COMPONENTS_URI,
  DEPLOY_DEVICE_URI,
  EDIT_DEVICE_URI,
  DELETE_DEVICE_URI,
  UPDATE_COMPONENT,
  DELETE_COMPONENT,
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
    .get(ALL_DEVICES_URI, { params: { network: networkID } })
    .then((response) => response.data);
};

export const createDeviceComponentApi = async (deviceName, componentType, data) => {
  const ctype = componentType;
  const headers = {
    service: 'create-device'
  };
  return await axios
    .post(ADD_COMPONENT_URI + deviceName, data, { params: { ctype } }, { headers })
    .then((response) => response.data);
};

export const softCreateDeviceApi = async (data, ctype) => {
  const headers = {
    service: 'soft-create-device'
  };
  return await axios
    .post(SOFT_EDIT_DEVICE_URI, data, { params: { ctype } }, { headers })
    .then((response) => response.data);
};

export const getDeviceComponentsApi = async (deviceName) => {
  return await axios
    .get(GET_COMPONENTS_URI, { params: { device: deviceName } })
    .then((response) => response.data);
};

export const getFilteredDevicesApi = async (params) => {
  return await axios.get(ALL_DEVICES_URI, { params }).then((response) => response.data);
};

export const getDeviceMaintenanceLogsApi = async (deviceName) => {
  return await axios.get(DEVICE_MAINTENANCE_LOG_URI + deviceName).then((response) => response.data);
};

export const getActivitiesApi = async (params) => {
  return await axios.get(ACTIVITY_URI, { params }).then((response) => response.data);
};

export const addMaintenanceLogApi = async (deviceName, logData) => {
  const headers = {
    service: 'add-maintenance-log'
  };
  return await axios
    .post(ADD_MAINTENANCE_LOGS_URI, logData, { params: { deviceName } }, { headers })
    .then((response) => response.data);
};

export const recallDeviceApi = async (deviceName) => {
  const headers = {
    service: 'recall-device'
  };
  return await axios
    .post(RECALL_DEVICE_URI, {}, { params: { deviceName } }, { headers })
    .then((response) => response.data);
};

export const deployDeviceApi = async (deviceName, deployData) => {
  const headers = {
    service: 'deploy-device'
  };
  return axios
    .post(DEPLOY_DEVICE_URI, deployData, { params: { deviceName } }, { headers })
    .then((response) => response.data);
};

export const getDeviceRecentFeedByChannelIdApi = async (channelId) => {
  return await axios
    .get(DEVICE_RECENT_FEEDS, { params: { channel: channelId } })
    .then((response) => response.data);
};

export const updateDeviceDetails = async (id, updateData) => {
  const headers = {
    service: 'update-device'
  };
  return await axios
    .put(EDIT_DEVICE_URI, updateData, { params: { id } }, { headers })
    .then((response) => response.data);
};

export const softUpdateDeviceDetails = async (deviceId, updateData) => {
  const headers = {
    service: 'soft-update-device'
  };
  return await axios
    .put(SOFT_EDIT_DEVICE_URI, updateData, { params: { id: deviceId } }, { headers })
    .then((response) => response.data);
};

export const deleteDeviceApi = async (deviceName) => {
  const headers = {
    service: 'delete-device'
  };
  return axios
    .delete(DELETE_DEVICE_URI, { params: { device: deviceName } }, { headers })
    .then((response) => response.data);
};

export const updateMaintenanceLogApi = async (deviceId, logData) => {
  const headers = {
    service: 'update-maintenance-log'
  };
  return axios
    .put(ACTIVITY_URI, logData, { params: { id: deviceId } }, { headers })
    .then((response) => response.data);
};

export const deleteMaintenanceLogApi = (deviceId) => {
  const headers = {
    service: 'delete-maintenance-log'
  };
  return axios
    .delete(ACTIVITY_URI, { params: { id: deviceId } }, { headers })
    .then((response) => response.data);
};

export const updateComponentApi = async (deviceName, componentName, data) => {
  return await axios
    .put(UPDATE_COMPONENT, data, {
      params: { device: deviceName, comp: componentName }
    })
    .then((response) => response.data);
};

export const deleteComponentApi = async (deviceName, componentName) => {
  return await axios
    .delete(DELETE_COMPONENT, {
      params: { device: deviceName, comp: componentName }
    })
    .then((response) => response.data);
};

export const deleteDevicePhotos = async (deviceId, urls) => {
  const headers = {
    service: 'delete-device-photo'
  };
  return await axios
    .delete(
      DELETE_DEVICE_PHOTO,
      {
        params: { id: deviceId },
        data: { photos: urls }
      },
      { headers }
    )
    .then((response) => response.data);
};

export const softCreateDevicePhoto = async (data) => {
  const headers = {
    service: 'soft-create-device-photo'
  };
  return await axios
    .post(SOFT_EDIT_DEVICE_IMAGE, data, { headers })
    .then((response) => response.data);
};

export const getDevicePhotos = async (params) => {
  return await axios
    .get(GET_DEVICE_IMAGES, { params: { device_id: params } })
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
  return await axios.get(`${SITES}/summary`, { params }).then((response) => response.data);
};

export const getSiteDetailsApi = async (site_id) => {
  return await axios.get(SITES, { params: { id: site_id } }).then((response) => response.data);
};

export const updateSiteApi = async (site_id, siteData) => {
  return await axios
    .put(SITES, siteData, { params: { id: site_id } })
    .then((response) => response.data);
};

export const createSiteApi = async (siteData) => {
  return await axios.post(SITES, siteData).then((response) => response.data);
};

export const deleteSiteApi = async (siteId) => {
  return await axios.delete(SITES, { params: { id: siteId } }).then((response) => response.data);
};

export const getAirQloudsApi = async (params) => {
  return await axios.get(AIRQLOUDS, { params }).then((response) => response.data);
};

export const getDashboardAirQloudsApi = async (params) => {
  return await axios.get(DASHBOARD_AIRQLOUDS, { params }).then((response) => response.data);
};

export const decryptKeyApi = async (encrypted_key) => {
  return await axios.post(DECRYPT, { encrypted_key }).then((response) => response.data);
};

export const QRCodeApi = async (params) => {
  return await axios.get(QRCODE, { params }).then((response) => response.data);
};

export const refreshAirQloudApi = async (params) => {
  return await axios.put(REFRESH_AIRQLOUD, {}, { params }).then((response) => response.data);
};
