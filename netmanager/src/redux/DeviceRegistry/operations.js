// for representing chained operations using redux-thunk
import {
    LOAD_ALL_DEVICES_SUCCESS,
    LOAD_ALL_DEVICES_FAILURE,
} from "./actions";
import { getAllDevicesApi } from "../../views/apis/deviceRegistry";

const transformDeviceArray = (devices) => {
    const devicesState = {}
    devices.map((device) => {
        devicesState[device.id] = device
    })
    return devicesState
}

export const loadDevicesData = () => {
  return async (dispatch) => {
    return await getAllDevicesApi()
      .then((responseData) => {
          if(responseData.devices){
              dispatch({
                  type: LOAD_ALL_DEVICES_SUCCESS,
                  payload: transformDeviceArray(responseData.devices),
              });
          }

      })
      .catch((err) => {
        dispatch({
          type: LOAD_ALL_DEVICES_FAILURE,
          payload: err,
        });
      });
  };
};
