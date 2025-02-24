import {
  LOAD_MAINTENANCE_LOGS_SUCCESS,
  RESET_MAINTENANCE_LOGS,
  INSERT_MAINTENANCE_LOGS_SUCCESS,
  UPDATE_SINGLE_MAINTENANCE_LOGS_SUCCESS,
  DELETE_SINGLE_MAINTENANCE_LOGS_SUCCESS,
} from "../actions";

import { LOGOUT_USER_SUCCESS } from "redux/Join/types";

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

    case UPDATE_SINGLE_MAINTENANCE_LOGS_SUCCESS:
      return {
        ...state,
        [action.payload.deviceName]: [
          ...(state[action.payload.deviceName] || []).slice(
            0,
            action.payload.index
          ),
          action.payload.log,
          ...(state[action.payload.deviceName] || []).slice(
            action.payload.index + 1
          ),
        ],
      };

    case DELETE_SINGLE_MAINTENANCE_LOGS_SUCCESS:
      return {
        ...state,
        [action.payload.deviceName]: [
          ...(state[action.payload.deviceName] || []).slice(
            0,
            action.payload.index
          ),
          ...(state[action.payload.deviceName] || []).slice(
            action.payload.index + 1
          ),
        ],
      };

    case LOGOUT_USER_SUCCESS:
      return initialState;
    default:
      return state;
  }
}
