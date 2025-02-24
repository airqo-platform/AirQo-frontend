import { UPDATE_USER_PREFERENCE_SUCCESS } from "./actions";
import { LOGOUT_USER_SUCCESS } from "redux/Join/types";

let initialState = {};

if (localStorage.userPreference) {
  initialState = JSON.parse(localStorage.userPreference);
}

export default function (state = initialState, action) {
  switch (action.type) {
    case UPDATE_USER_PREFERENCE_SUCCESS:
      localStorage.setItem("userPreference", JSON.stringify(action.payload));
      return action.payload;

    case LOGOUT_USER_SUCCESS:
      return initialState;

    default:
      return state;
  }
}
