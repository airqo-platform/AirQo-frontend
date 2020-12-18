// for representing chained operations using redux-thunk
import {
  LOAD_DEVICES_STATUS_SUCCESS,
  LOAD_DEVICES_STATUS_FAILURE,
    LOAD_NETWORK_UPTIME_SUCCESS,
    LOAD_NETWORK_UPTIME_FAILURE
} from "./actions";
import { getDevicesStatusApi, getNetworkUptimeApi } from "views/apis/deviceMonitoring";

export const loadDevicesStatusData = () => async (dispatch) => {
  return await getDevicesStatusApi()
    .then((responseData) => {
      dispatch({
        type: LOAD_DEVICES_STATUS_SUCCESS,
        payload: responseData.data[0],
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_DEVICES_STATUS_FAILURE,
        payload: err,
      });
    });
};

export const loadNetworkUptimeData = (days) => async (dispatch) => {
    return await getNetworkUptimeApi({ days })
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
}
