import { LOAD_MAINTENANCE_LOGS_SUCCESS } from "../actions";

export default function (state = {}, action) {
  switch (action.type) {
    case LOAD_MAINTENANCE_LOGS_SUCCESS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
