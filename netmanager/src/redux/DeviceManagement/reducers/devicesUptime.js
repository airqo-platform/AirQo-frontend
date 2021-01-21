import { LOAD_ALL_DEVICES_UPTIME_SUCCESS } from "../actions";

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_ALL_DEVICES_UPTIME_SUCCESS:
      return action.payload;
    default:
      return state;
  }
}
