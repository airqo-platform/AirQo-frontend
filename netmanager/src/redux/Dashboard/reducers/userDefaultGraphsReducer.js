import {
  LOAD_USER_DEFAULT_GRAPHS_SUCCESS,
  RESET_USER_GRAPH_DEFAULTS_SUCCESS,
  UPDATE_USER_DEFAULT_GRAPHS_SUCCESS,
} from "../actions";

import { LOGOUT_USER_SUCCESS } from "redux/Join/types";

const initialState = [];

export default function (state = initialState, action) {
  switch (action.type) {
    case RESET_USER_GRAPH_DEFAULTS_SUCCESS:
      return initialState;

    case LOAD_USER_DEFAULT_GRAPHS_SUCCESS:
      return action.payload;

    case UPDATE_USER_DEFAULT_GRAPHS_SUCCESS:
      return [...state, action.payload];

    case LOGOUT_USER_SUCCESS:
      return initialState;

    default:
      return state;
  }
}
