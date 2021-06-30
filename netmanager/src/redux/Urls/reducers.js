import { UPDATE_DEVICE_OVERVIEW_BACK_URL_SUCCESS } from "./actions";

const initialState = {
  deviceOverBackUrl: "/registry",
  siteBackUrl: "/sites",
};

export default function (state = initialState, action) {
  switch (action.type) {
    case UPDATE_DEVICE_OVERVIEW_BACK_URL_SUCCESS:
      return { ...state, deviceOverBackUrl: action.payload };
    default:
      return state;
  }
}
