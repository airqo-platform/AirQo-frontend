// take a slice of the application state and return some data based on that
import { useSelector } from "react-redux";
import uptimeLeaderboard from "./reducers/uptimeLeaderboard";

export const useDevicesStatusData = () => {
  return useSelector((state) => state.deviceManagement.deviceStatus);
};

export const useNetworkUptimeData = () => {
  return useSelector((state) => state.deviceManagement.networkUptime);
};

export const useDevicesUptimeData = () => {
  return useSelector((state) => state.deviceManagement.devicesUptime);
};

export const useDeviceUptimeData = (deviceName) => {
  return useSelector(
    (state) => state.deviceManagement.devicesUptime[deviceName] || []
  );
};

export const useUptimeLeaderboardData = () => {
  return useSelector((state) => state.deviceManagement.uptimeLeaderboard);
};
