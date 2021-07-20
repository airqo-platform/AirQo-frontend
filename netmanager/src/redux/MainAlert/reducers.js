import {
  UPDATE_ALERT_SUCCESS,
  HIDE_ALERT_SUCCESS,
  RESET_ALERT_SUCCESS,
} from "./actions";

import { LOGOUT_USER_SUCCESS } from "redux/Join/types";

const initialState = {
  show: false,
  message: "",
  severity: "success",
};

export default function (state = initialState, action) {
  switch (action.type) {
    case RESET_ALERT_SUCCESS:
      return initialState;

    case UPDATE_ALERT_SUCCESS:
      return action.payload;

    case HIDE_ALERT_SUCCESS:
      return action.payload;

    case LOGOUT_USER_SUCCESS:
      return initialState;

    default:
      return state;
  }
}
