import {
  LOAD_ALL_DEVICES_UPTIME_SUCCESS,
  LOAD_SINGLE_UPTIME_SUCCESS,
} from "../actions";
import { LOGOUT_USER_SUCCESS } from "redux/Join/types";

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_ALL_DEVICES_UPTIME_SUCCESS:
      return { ...state, ...action.payload };

    case LOAD_SINGLE_UPTIME_SUCCESS:
      return { ...state, ...action.payload };

    case LOGOUT_USER_SUCCESS:
      return initialState;

    default:
      return state;
  }
}
