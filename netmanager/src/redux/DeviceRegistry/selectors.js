// take a slice of the application state and return some data based on that
import { useSelector } from "react-redux";

export const useDevicesData = () => {
  return useSelector((state) => state.deviceRegistry.devices);
};

export const useMaintenanceLogsData = () => {
  return useSelector((state) => state.deviceRegistry.maintenanceLogs);
};

export const useDeviceLogsData = (deviceName) => {
  return useSelector(
    (state) => state.deviceRegistry.maintenanceLogs[deviceName] || []
  );
};

export const useDeviceComponentsData = (deviceName) => {
  return useSelector(
    (state) => state.deviceRegistry.components[deviceName] || []
  );
};

export const useDeviceUpTimeData = (deviceName) => {
  return useSelector((state) => state.deviceRegistry.upTime[deviceName] || {});
};

export const useDeviceBatteryVoltageData = (deviceName) => {
  return useSelector(
    (state) => state.deviceRegistry.batteryVoltage[deviceName] || {}
  );
};

export const useDeviceSensorCorrelationData = (deviceName) => {
  return useSelector(
    (state) => state.deviceRegistry.sensorCorrelation[deviceName] || {}
  );
};
