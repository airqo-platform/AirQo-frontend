import { UPDATE_USER_PREFERENCE_SUCCESS } from "./actions";

let initialState = {};

if (localStorage.userPreference) {
  initialState = JSON.parse(localStorage.userPreference);
}

export default function (state = initialState, action) {
  switch (action.type) {
    case UPDATE_USER_PREFERENCE_SUCCESS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
