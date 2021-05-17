import { stripTrailingSlash } from "../utils";

const BASE_DEVICE_MONITORING_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_DEVICE_MONITORING_URL ||
    process.env.REACT_APP_BASE_URL
);

export const GET_DEVICE_STATUS_SUMMARY = `${BASE_DEVICE_MONITORING_URL}/monitor/device/status`;

export const GET_MAINTENANCE_LOGS = `${BASE_DEVICE_MONITORING_URL}/monitor/device/maintenance_logs`;

export const GET_DEVICE_MAINTENANCE_LOG = `${BASE_DEVICE_MONITORING_URL}/monitor/device/maintenance_logs/`;

export const GET_DEVICE_POWER_TYPE = `${BASE_DEVICE_MONITORING_URL}/monitor/device/power_type`;

export const GET_DEVICE_STATUS_FOR_PIECHART_DISPLAY = `${BASE_DEVICE_MONITORING_URL}/monitor/device/status/latest`;

export const GET_LATEST_OFFLINE_DEVICES = `${BASE_DEVICE_MONITORING_URL}/monitor/devices/offline`;

export const GET_NETWORK_UPTIME = `${BASE_DEVICE_MONITORING_URL}/monitor/network/uptime`;

export const GET_DEVICE_UPTIME = `${BASE_DEVICE_MONITORING_URL}/monitor/device/uptime`;

export const GET_DEVICE_BATTERY_VOLTAGE = `${BASE_DEVICE_MONITORING_URL}/monitor/device/batteryvoltage`;

export const GET_DEVICE_SENSOR_CORRELATION = `${BASE_DEVICE_MONITORING_URL}/monitor/device/sensors/correlation`;

export const DEVICE_MAINTENANCE_LOG_URI = `${BASE_DEVICE_MONITORING_URL}/monitor/device/maintenance_logs/`;

export const GET_NETWORK_BEST_PERFORMING_DEVICES = `${BASE_DEVICE_MONITORING_URL}/monitor/network/devices/bestperforming`;

export const GET_NETWORK_WORST_PERFORMING_DEVICES = `${BASE_DEVICE_MONITORING_URL}/monitor/network/devices/worstperforming`;

export const ALL_DEVICES_STATUS = `${BASE_DEVICE_MONITORING_URL}/monitor/devices/status`;

export const ALL_DEVICES_UPTIME = `${BASE_DEVICE_MONITORING_URL}/monitor/devices/uptime`;

export const GET_ONLINE_OFFLINE_MAINTENANCE_STATUS = `${BASE_DEVICE_MONITORING_URL}/monitor/devices/online_offline`;
