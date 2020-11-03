import { REFRESH_FILTER_LOCATION_DATA_SUCCESS, RESET_LOCATION_FILTER_SUCCESS } from "../actions";

const initialState = []

export default function (state = initialState, action) {
  switch (action.type) {
    case RESET_LOCATION_FILTER_SUCCESS:
      return initialState;
    case REFRESH_FILTER_LOCATION_DATA_SUCCESS:
      return action.payload;
    default:
      return state;
  }
}
