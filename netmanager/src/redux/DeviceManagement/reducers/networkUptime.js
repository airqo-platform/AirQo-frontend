import { LOAD_NETWORK_UPTIME_SUCCESS } from "../actions";

const initialState = [];

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_NETWORK_UPTIME_SUCCESS:
      return action.payload;
    default:
      return state;
  }
};
