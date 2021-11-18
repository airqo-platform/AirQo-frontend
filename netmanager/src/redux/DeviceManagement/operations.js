// for representing chained operations using redux-thunk
import { isEmpty } from "underscore";
import {
  LOAD_DEVICES_STATUS_SUCCESS,
  LOAD_DEVICES_STATUS_FAILURE,
  LOAD_NETWORK_UPTIME_SUCCESS,
  LOAD_NETWORK_UPTIME_FAILURE,
  LOAD_ALL_DEVICES_UPTIME_SUCCESS,
  LOAD_ALL_DEVICES_UPTIME_FAILURE,
  LOAD_UPTIME_LEADERBOARD_SUCCESS,
  LOAD_UPTIME_LEADERBOARD_FAILURE,
  LOAD_SINGLE_UPTIME_SUCCESS,
  LOAD_SINGLE_UPTIME_FAILURE,
  LOAD_MANAGEMENT_DEVICES_SUCCESS,
  LOAD_FILTERED_DEVICES_SUCCESS,
} from "./actions";
import {
  getDevicesStatusApi,
  getNetworkUptimeApi,
  getAllDevicesUptimeApi,
  getUptimeLeaderboardApi,
} from "views/apis/deviceMonitoring";
import { updateDevices } from "../../utils/deviceStatus";

export const loadUptimeLeaderboardData = (params) => async (dispatch) => {
  return await getUptimeLeaderboardApi(params)
    .then((responseData) => {
      if (isEmpty(responseData.data)) return;
      dispatch({
        type: LOAD_UPTIME_LEADERBOARD_SUCCESS,
        payload: responseData.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_UPTIME_LEADERBOARD_FAILURE,
        payload: err,
      });
    });
};

export const loadDevicesStatusData = (params) => async (dispatch) => {
  return await getDevicesStatusApi(params)
    .then((responseData) => {
      let data;
      try {
        data = responseData.data[0];
      } catch (err) {
        data = JSON.parse(responseData.data.replace(/\bNaN\b/g, "null"))[0];
      }

      const devices = [
        ...updateDevices(data.offline_devices, { isOnline: false }),
        ...updateDevices(data.online_devices, { isOnline: true }),
      ];

      dispatch({
        type: LOAD_DEVICES_STATUS_SUCCESS,
        payload: data,
      });
      dispatch({
        type: LOAD_MANAGEMENT_DEVICES_SUCCESS,
        payload: devices,
      });
      dispatch({
        type: LOAD_FILTERED_DEVICES_SUCCESS,
        payload: devices,
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_DEVICES_STATUS_FAILURE,
        payload: err,
      });
    });
};

export const updateFilteredDevicesData = (filteredDevices) => (dispatch) => {
  return dispatch({
    type: LOAD_FILTERED_DEVICES_SUCCESS,
    payload: filteredDevices,
  });
};

export const loadNetworkUptimeData = (params) => async (dispatch) => {
  return await getNetworkUptimeApi(params)
    .then((responseData) => {
      dispatch({
        type: LOAD_NETWORK_UPTIME_SUCCESS,
        payload: responseData.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_NETWORK_UPTIME_FAILURE,
        payload: err,
      });
    });
};

export const loadDevicesUptimeData = (params) => async (dispatch) => {
  return await getAllDevicesUptimeApi(params)
    .then((responseData) => {
      if (!isEmpty(responseData.data)) {
        const devicesUptime = {};
        responseData.data.map((val) => {
          devicesUptime[val._id] = val.values;
        });

        dispatch({
          type: LOAD_ALL_DEVICES_UPTIME_SUCCESS,
          payload: devicesUptime,
        });
      }
    })
    .catch((err) => {
      dispatch({
        type: LOAD_ALL_DEVICES_UPTIME_FAILURE,
        payload: err,
      });
    });
};

export const loadSingleDeviceUptime = (params) => async (dispatch) => {
  return await getAllDevicesUptimeApi(params)
    .then((responseData) => {
      if (isEmpty(responseData.data)) return;
      const { _id, values } = (responseData.data && responseData.data[0]) || {};
      dispatch({
        type: LOAD_SINGLE_UPTIME_SUCCESS,
        payload: { [_id]: values },
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_SINGLE_UPTIME_FAILURE,
        payload: err,
      });
    });
};
