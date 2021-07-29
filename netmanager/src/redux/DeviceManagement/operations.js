// for representing chained operations using redux-thunk
import { isEmpty } from "underscore";
import {
  LOAD_DEVICES_STATUS_SUCCESS,
  LOAD_DEVICES_STATUS_FAILURE,
  LOAD_NETWORK_UPTIME_SUCCESS,
  LOAD_NETWORK_UPTIME_FAILURE,
  LOAD_ALL_DEVICES_UPTIME_SUCCESS,
  LOAD_ALL_DEVICES_UPTIME_FAILURE,
} from "./actions";
import {
  getDevicesStatusApi,
  getNetworkUptimeApi,
  getAllDevicesUptimeApi,
} from "views/apis/deviceMonitoring";

export const loadDevicesStatusData = (params) => async (dispatch) => {
  return await getDevicesStatusApi(params)
    .then((responseData) => {
      let data;
      try {
        data = responseData.data[0];
      } catch (err) {
        data = JSON.parse(responseData.data.replace(/\bNaN\b/g, "null"))[0];
      }

      dispatch({
        type: LOAD_DEVICES_STATUS_SUCCESS,
        payload: data,
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_DEVICES_STATUS_FAILURE,
        payload: err,
      });
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
