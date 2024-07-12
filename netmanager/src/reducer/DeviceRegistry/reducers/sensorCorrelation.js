import { LOAD_DEVICE_SENSOR_CORRELATION_SUCCESS } from "../actions";
import { LOGOUT_USER_SUCCESS } from "redux/Join/types";

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_DEVICE_SENSOR_CORRELATION_SUCCESS:
      return { ...state, [action.payload.deviceName]: action.payload.data };

    case LOGOUT_USER_SUCCESS:
      return initialState;

    default:
      return state;
  }
}
