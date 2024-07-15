import { LOAD_DEVICE_UPTIME_SUCCESS } from "../actions";
import { LOGOUT_USER_SUCCESS } from "reducer/Join/types";

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_DEVICE_UPTIME_SUCCESS:
      return { ...state, [action.payload.deviceName]: action.payload.data };

    case LOGOUT_USER_SUCCESS:
      return initialState;

    default:
      return state;
  }
}
