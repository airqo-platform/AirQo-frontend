import { UPDATE_DEVICE_OVERVIEW_BACK_URL_SUCCESS } from "./actions";

export const updateDeviceBackUrl = (url) => (dispatch) => {
  return dispatch({
    type: UPDATE_DEVICE_OVERVIEW_BACK_URL_SUCCESS,
    payload: url,
  });
};
