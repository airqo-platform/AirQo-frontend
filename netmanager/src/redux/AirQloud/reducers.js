import { LOGOUT_USER_SUCCESS } from "redux/Join/types";
import {
  LOAD_ALL_AIRQLOUDS_SUCCESS,
  SET_CURRENT_AIRQLOUD_SUCCESS,
} from "./actions";

const initialState = {
  airqlouds: {},
  currentAirQloud: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOGOUT_USER_SUCCESS:
      return initialState;

    case LOAD_ALL_AIRQLOUDS_SUCCESS:
      return { ...state, airqlouds: action.payload };

    case SET_CURRENT_AIRQLOUD_SUCCESS:
      return { ...state, currentAirQloud: action.payload };

    default:
      return state;
  }
}
