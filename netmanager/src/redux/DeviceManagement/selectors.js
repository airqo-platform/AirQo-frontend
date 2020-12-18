// take a slice of the application state and return some data based on that
import { useSelector } from "react-redux";

export const useDevicesStatusData = () => {
  return useSelector((state) => state.deviceManagement.deviceStatus);
};

export const useNetworkUptimeData = () => {
  return useSelector((state) => state.deviceManagement.networkUptime);
};

