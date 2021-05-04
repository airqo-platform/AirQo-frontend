// for representing chained operations using redux-thunk
import {
  UPDATE_ALERT_SUCCESS,
  HIDE_ALERT_SUCCESS,
  RESET_ALERT_SUCCESS,
} from "./actions";

export const updateMainAlert = (newAlertData) => {
  return (dispatch) => {
    dispatch({
      type: UPDATE_ALERT_SUCCESS,
      payload: newAlertData,
    });
  };
};

export const hideMainAlert = () => {
  return (dispatch) => {
    dispatch({
      type: HIDE_ALERT_SUCCESS,
      payload: { show: false, message: "", severity: "success" },
    });
  };
};

export const resetAlertState = () => (dispatch) => {
  dispatch({ type: RESET_ALERT_SUCCESS });
};
