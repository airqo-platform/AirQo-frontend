import { LOAD_ACTIVITY_OPTIONS_SUCCESS } from "../actions";
import { LOGOUT_USER_SUCCESS } from "reducer/Join/types";

const initialState = [];

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_ACTIVITY_OPTIONS_SUCCESS:
      return action.payload;

    case LOGOUT_USER_SUCCESS:
      return initialState;

    default:
      return state;
  }
}