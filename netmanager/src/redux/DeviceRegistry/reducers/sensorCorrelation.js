import { LOAD_DEVICE_SENSOR_CORRELATION_SUCCESS } from "../actions";

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_DEVICE_SENSOR_CORRELATION_SUCCESS:
      return { ...state, [action.payload.deviceName]: action.payload.data };
    default:
      return state;
  }
}
