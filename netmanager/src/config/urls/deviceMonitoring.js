import { stripTrailingSlash } from '../utils';

const BASE_DEVICE_MONITORING_URL_V2 = stripTrailingSlash(process.env.REACT_APP_BASE_URL_V2);

export const GET_DEVICE_STATUS_SUMMARY = `${BASE_DEVICE_MONITORING_URL_V2}/monitor/device/status`;

export const GET_NETWORK_UPTIME = `${BASE_DEVICE_MONITORING_URL_V2}/monitor/network/uptime`;

export const GET_DEVICE_UPTIME_LEADERBOARD = `${BASE_DEVICE_MONITORING_URL_V2}/monitor/device/uptime/leaderboard`;

export const GET_DEVICE_BATTERY_VOLTAGE = `${BASE_DEVICE_MONITORING_URL_V2}/monitor/devices/battery`;

export const GET_DEVICE_SENSOR_CORRELATION = `${BASE_DEVICE_MONITORING_URL_V2}/monitor/device/sensors/correlation`;

export const DEVICE_MAINTENANCE_LOG_URI = `${BASE_DEVICE_MONITORING_URL_V2}/monitor/device/maintenance_logs/`;

export const ALL_DEVICES_STATUS = `${BASE_DEVICE_MONITORING_URL_V2}/monitor/devices/status`;

export const DEVICES_UPTIME = `${BASE_DEVICE_MONITORING_URL_V2}/monitor/devices/uptime`;

export const GET_ONLINE_OFFLINE_MAINTENANCE_STATUS = `${BASE_DEVICE_MONITORING_URL_V2}/monitor/devices/online_offline`;

export const GENERATE_AIRQLOUD_UPTIME_SUMMARY_URI = `${BASE_DEVICE_MONITORING_URL_V2}/monitor/uptime`;

export const GET_FAULTS = `${BASE_FAULT_DETECTION_URL}/predict/faulty-devices`;
