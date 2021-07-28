import axios from "axios";
import {
  GET_ONLINE_OFFLINE_MAINTENANCE_STATUS,
  GET_DEVICE_BATTERY_VOLTAGE,
  GET_DEVICE_SENSOR_CORRELATION,
  ALL_DEVICES_STATUS,
  GET_NETWORK_UPTIME,
  DEVICES_UPTIME,
} from "config/urls/deviceMonitoring";

export const onlineOfflineMaintenanceStatusApi = async () => {
  return await axios
    .get(GET_ONLINE_OFFLINE_MAINTENANCE_STATUS)
    .then((response) => response.data);
};

export const getDeviceUptimeApi = async (params) => {
  return await axios
    .get(DEVICES_UPTIME, { params })
    .then((response) => response.data);
};

export const getDeviceBatteryVoltageApi = async (params) => {
  return await axios
    .get(GET_DEVICE_BATTERY_VOLTAGE, { params })
    .then((response) => response.data);
};

export const getDeviceSensorCorrelationApi = async (params) => {
  return await axios
    .get(GET_DEVICE_SENSOR_CORRELATION, { params })
    .then((response) => response.data);
};

export const getDevicesStatusApi = async (params) => {
  return await axios
    .get(ALL_DEVICES_STATUS, { params })
    .then((response) => response.data);
};

export const getNetworkUptimeApi = async (params) => {
  return await axios
    .get(GET_NETWORK_UPTIME, { params })
    .then((response) => response.data);
};

export const getAllDevicesUptimeApi = async (params) => {
  return await axios
    .get(DEVICES_UPTIME, { params })
    .then((response) => response.data);
};
