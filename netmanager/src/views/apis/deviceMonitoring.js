import axios from "axios";
import constants from "../../config/constants";

export const onlineOfflineMaintenanceStatusApi = async () => {
  return await axios
    .get(constants.GET_ONLINE_OFFLINE_MAINTENANCE_STATUS)
    .then((response) => response.data);
};

export const getDeviceUptimeApi = async (params) => {
  return await axios
    .get(constants.GET_DEVICE_UPTIME, { params })
    .then((response) => response.data);
};
