import {
  REFRESH_FILTER_LOCATION_DATA_SUCCESS,
  RESET_LOCATION_FILTER_SUCCESS,
} from "../actions";
import { LOGOUT_USER_SUCCESS } from "redux/Join/types";

const initialState = [];

export default function (state = initialState, action) {
  switch (action.type) {
    case RESET_LOCATION_FILTER_SUCCESS:
      return initialState;
    case REFRESH_FILTER_LOCATION_DATA_SUCCESS:
      return action.payload;
    case LOGOUT_USER_SUCCESS:
      return initialState;
    default:
      return state;
  }
}
