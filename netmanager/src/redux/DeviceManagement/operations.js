// for representing chained operations using redux-thunk
import {
  LOAD_DEVICES_STATUS_SUCCESS,
  LOAD_DEVICES_STATUS_FAILURE,
} from "./actions";
import { getDevicesStatusApi } from "views/apis/deviceMonitoring";

export const loadDevicesStatusData = () => async (dispatch) => {
  return await getDevicesStatusApi()
    .then((responseData) => {
      console.log("response data 0");
      console.log("xxxxxx", typeof responseData);
      console.log(responseData);
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
