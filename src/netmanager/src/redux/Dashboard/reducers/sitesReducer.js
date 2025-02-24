import { LOAD_DASHBOARD_SITES_SUCCESS } from "../actions";
import { LOGOUT_USER_SUCCESS } from "redux/Join/types";

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_DASHBOARD_SITES_SUCCESS:
      return action.payload;
    case LOGOUT_USER_SUCCESS:
      return initialState;
    default:
      return state;
  }
}
