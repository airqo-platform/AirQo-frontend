import { LOAD_ALL_LOCATIONS_SUCCESS, RESET_LOCATIONS_SUCCESS } from "../actions";

const initialState = [];

export default function (state = initialState, action) {
  switch (action.type) {
    case RESET_LOCATIONS_SUCCESS:
      return initialState;
    case LOAD_ALL_LOCATIONS_SUCCESS:
      return action.payload;
    default:
      return state;
  }
}
