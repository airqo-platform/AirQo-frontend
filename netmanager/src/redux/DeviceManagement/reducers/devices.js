import {
  LOAD_MANAGEMENT_DEVICES_SUCCESS,
  LOAD_FILTERED_DEVICES_SUCCESS,
  LOAD_ACTIVE_FILTERS_SUCCESS,
} from "../actions";
import { LOGOUT_USER_SUCCESS } from "redux/Join/types";

const initialState = [];

export const devicesReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_MANAGEMENT_DEVICES_SUCCESS:
      return action.payload;
    case LOGOUT_USER_SUCCESS:
      return initialState;
    default:
      return state;
  }
};

export const filteredDevicesReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_FILTERED_DEVICES_SUCCESS:
      return action.payload;
    case LOGOUT_USER_SUCCESS:
      return initialState;
    default:
      return state;
  }
};

const activeFiltersInitState = {
  main: {
    all: true,
    due: true,
    overDue: true,
    solar: true,
    alternator: true,
    mains: true,
  },
};

export const activeFiltersReducer = (state = activeFiltersInitState, action) => {
  switch (action.type) {
    case LOAD_ACTIVE_FILTERS_SUCCESS:
      return action.payload;
    case LOGOUT_USER_SUCCESS:
      return activeFiltersInitState;
    default:
      return state;
  }
};
