import {
  INSERT_NEW_DEVICE_SUCCESS,
  LOAD_ALL_DEVICES_SUCCESS,
  RESET_DEVICE_SUCCESS,
  UPDATE_SINGLE_DEVICE_SUCCESS,
} from "../actions";

import { LOGOUT_USER_SUCCESS } from "redux/Join/types";

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case RESET_DEVICE_SUCCESS:
      return initialState;

    case LOAD_ALL_DEVICES_SUCCESS:
      return action.payload;

    case UPDATE_SINGLE_DEVICE_SUCCESS:
      return {
        ...state,
        [action.payload.deviceName]: {
          ...(state[action.payload.deviceName] || {}),
          ...action.payload.data,
        },
      };

    case INSERT_NEW_DEVICE_SUCCESS:
      return {
        ...state,
        [action.payload.deviceName]: action.payload,
      };

    case LOGOUT_USER_SUCCESS:
      return initialState;

    default:
      return state;
  }
}
