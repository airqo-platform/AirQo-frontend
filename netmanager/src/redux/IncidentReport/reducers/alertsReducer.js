// this is for the latest mainteance records and the due date for device maintenance

/* eslint-disable */
import {
  GET_MAINTENANCE_FAILED,
  GET_MAINTENANCE_SUCCESS,
  GET_MAINTENANCE_REQUEST,
} from "../types";

const isEmpty = require("is-empty");

const initialState = {
  alerts: [],
  isFetching: false,
  error: null,
  successMsg: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    /************************* fetch alerts ****************************************** */
    case GET_MAINTENANCE_REQUEST:
      return {
        ...state,
        alerts: state.alerts,
        isFetching: true,
        error: null,
        successMsg: null,
      };
    case GET_MAINTENANCE_SUCCESS:
      return {
        ...state,
        alerts: action.maintenanceLogs,
        isFetching: false,
        error: null,
        successMsg: action.message,
      };
    case GET_MAINTENANCE_FAILED:
      return {
        ...state,
        alerts: [],
        isFetching: false,
        error: action.error,
        successMsg: null,
      };

    default:
      return state;
  }
}
