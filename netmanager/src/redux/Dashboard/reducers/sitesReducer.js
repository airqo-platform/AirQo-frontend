import { LOAD_DASHBOARD_SITES_SUCCESS } from "../actions";

const initialState = [];

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_DASHBOARD_SITES_SUCCESS:
      return action.payload;
    default:
      return state;
  }
}