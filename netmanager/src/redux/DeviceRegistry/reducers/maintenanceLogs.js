import {
  LOAD_MAINTENANCE_LOGS_SUCCESS,
  RESET_MAINTENANCE_LOGS,
  INSERT_MAINTENANCE_LOGS_SUCCESS,
} from "../actions";

const initialState = {};
export default function (state = initialState, action) {
  switch (action.type) {
    case RESET_MAINTENANCE_LOGS:
      return initialState;
    case LOAD_MAINTENANCE_LOGS_SUCCESS:
      return { ...state, ...action.payload };
    case INSERT_MAINTENANCE_LOGS_SUCCESS:
      return {
        ...state,
        [action.payload.deviceName]: [
          action.payload.log,
          ...(state[action.payload.deviceName] || []),
        ],
      };
    default:
      return state;
  }
}
