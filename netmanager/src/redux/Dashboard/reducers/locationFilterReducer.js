import { REFRESH_FILTER_LOCATION_DATA_SUCCESS } from "../actions";

export default function (state = [], action) {
  switch (action.type) {
    case REFRESH_FILTER_LOCATION_DATA_SUCCESS:
      return action.payload;
    default:
      return state;
  }
}
