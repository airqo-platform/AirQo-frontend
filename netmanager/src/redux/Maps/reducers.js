import { RENDER_MAP_DEFAULTS, RESET_MAP_DEFAULTS_SUCCESS } from "./types";

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
    default:
      return state;
  }
}
