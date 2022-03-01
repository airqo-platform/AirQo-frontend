// for representing chained operations using redux-thunk
import {
  UPDATE_ALERT_SUCCESS,
  HIDE_ALERT_SUCCESS,
  RESET_ALERT_SUCCESS,
} from "./actions";

export const updateMainAlert = (newAlertData) => {
  return (dispatch, getState) => {
    const oldState = getState().mainAlert;
    if (oldState.timeout) {
      clearTimeout(oldState.timeout);
    }
    const timeout = setTimeout(() => {
      /* we get the state at this point inorder to get the most recent */
      const state = getState().mainAlert;
      dispatch({
        type: HIDE_ALERT_SUCCESS,
        payload: { ...state, show: false, timeout: null },
      });
    }, 3000);
    dispatch({
      type: UPDATE_ALERT_SUCCESS,
      payload: { ...newAlertData, timeout },
    });
  };
};

export const hideMainAlert = () => {
  return (dispatch, getState) => {
    const state = getState().mainAlert;
    dispatch({
      type: HIDE_ALERT_SUCCESS,
      payload: { ...state, show: false },
    });
  };
};

export const resetAlertState = () => (dispatch) => {
  dispatch({ type: RESET_ALERT_SUCCESS });
};
