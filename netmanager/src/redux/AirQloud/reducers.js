import { LOGOUT_USER_SUCCESS } from "redux/Join/types";
import { LOAD_ALL_AIRQLOUDS_SUCCESS } from "./actions";

const initialState = {
  airqlouds: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOGOUT_USER_SUCCESS:
      return initialState;

    case LOAD_ALL_AIRQLOUDS_SUCCESS:
      return { ...state, airqlouds: action.payload };

    default:
      return state;
  }
}
