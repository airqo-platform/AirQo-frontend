import { LOAD_NETWORK_UPTIME_SUCCESS } from "../actions";
import { LOGOUT_USER_SUCCESS } from "redux/Join/types";

const initialState = [];

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_NETWORK_UPTIME_SUCCESS:
      return action.payload;
    case LOGOUT_USER_SUCCESS:
      return initialState;
    default:
      return state;
  }
}
