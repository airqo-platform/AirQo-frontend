import { UPDATE_DEVICE_OVERVIEW_BACK_URL_SUCCESS } from "./actions";
import { LOGOUT_USER_SUCCESS } from "redux/Join/types";

const initialState = {
  deviceOverBackUrl: "/registry",
  siteBackUrl: "/sites",
};

export default function (state = initialState, action) {
  switch (action.type) {
    case UPDATE_DEVICE_OVERVIEW_BACK_URL_SUCCESS:
      return { ...state, deviceOverBackUrl: action.payload };

    case LOGOUT_USER_SUCCESS:
      return initialState;

    default:
      return state;
  }
}
