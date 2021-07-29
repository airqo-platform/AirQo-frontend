import { RENDER_MAP_DEFAULTS, RESET_MAP_DEFAULTS_SUCCESS } from "./types";
import { LOGOUT_USER_SUCCESS } from "redux/Join/types";

// create initial state

const initialState = {
  coordinates: {},
  initMap: {
    lat: 1.3157546,
    lng: 32.4509096,
    zoom: 7,
  },
};

export default function (state = initialState, action) {
  switch (action.type) {
    case RESET_MAP_DEFAULTS_SUCCESS:
      return initialState;
    case RENDER_MAP_DEFAULTS:
      return {
        ...state,
      };
    case LOGOUT_USER_SUCCESS:
      return initialState;
    default:
      return state;
  }
}
