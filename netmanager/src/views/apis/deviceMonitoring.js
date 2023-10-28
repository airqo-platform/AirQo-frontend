import {
  GET_ONLINE_OFFLINE_MAINTENANCE_STATUS,
  GET_DEVICE_BATTERY_VOLTAGE,
  GET_DEVICE_SENSOR_CORRELATION,
  ALL_DEVICES_STATUS,
  GET_NETWORK_UPTIME,
  GET_DEVICE_UPTIME_LEADERBOARD,
  DEVICES_UPTIME,
  GENERATE_AIRQLOUD_UPTIME_SUMMARY_URI
} from 'config/urls/deviceMonitoring';
import { isEmpty } from 'validate.js';
import createAxiosInstance from './axiosConfig';

export const onlineOfflineMaintenanceStatusApi = async () => {
  return await createAxiosInstance()
    .get(GET_ONLINE_OFFLINE_MAINTENANCE_STATUS)
    .then((response) => response.data);
};

export const getDeviceUptimeApi = async (params) => {
  return await createAxiosInstance()
    .get(DEVICES_UPTIME, { params })
    .then((response) => response.data);
};

export const getDeviceBatteryVoltageApi = async (params) => {
  return await createAxiosInstance()
    .get(GET_DEVICE_BATTERY_VOLTAGE, { params })
    .then((response) => response.data);
};

export const getDeviceSensorCorrelationApi = async (params) => {
  return await createAxiosInstance()
    .get(GET_DEVICE_SENSOR_CORRELATION, { params })
    .then((response) => response.data);
};

export const getDevicesStatusApi = async (params) => {
  return await createAxiosInstance()
    .get(ALL_DEVICES_STATUS, { params })
    .then((response) => response.data);
};

export const getNetworkUptimeApi = async (params) => {
  return await createAxiosInstance()
    .get(GET_NETWORK_UPTIME, { params })
    .then((response) => response.data);
};

export const getAllDevicesUptimeApi = async (params) => {
  return await createAxiosInstance()
    .get(DEVICES_UPTIME, { params })
    .then((response) => response.data);
};

export const getUptimeLeaderboardApi = async (params) => {
  return await createAxiosInstance()
    .get(GET_DEVICE_UPTIME_LEADERBOARD, { params })
    .then((response) => response.data);
};

export const generateAirQloudUptimeSummaryApi = async (data) => {
  return await createAxiosInstance()
    .post(GENERATE_AIRQLOUD_UPTIME_SUMMARY_URI, data)
    .then((response) => response.data);
};
