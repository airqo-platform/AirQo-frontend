// this is for the list of recent anormalies on the network

/* eslint-disable */
import {
  GET_ISSUES_FAILED,
  GET_ISSUES_SUCCESS,
  GET_ISSUES_REQUEST,
} from "../types";

const initialState = {
  issues: [],
  isFetching: false,
  error: null,
  successMsg: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    /************************* fetch issues ****************************************** */
    case GET_ISSUES_REQUEST:
      return {
        ...state,
        issues: state.issues,
        isFetching: true,
        error: null,
        successMsg: null,
      };
    case GET_ISSUES_SUCCESS:
      return {
        ...state,
        issues: action.issueLogs,
        isFetching: false,
        error: null,
        successMsg: action.message,
      };
    case GET_ISSUES_FAILED:
      return {
        ...state,
        issues: [],
        isFetching: false,
        error: action.error,
        successMsg: null,
      };

    default:
      return state;
  }
}
