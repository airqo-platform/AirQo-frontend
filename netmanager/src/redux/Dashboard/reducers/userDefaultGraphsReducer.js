import {
  LOAD_USER_DEFAULT_GRAPHS_SUCCESS,
  RESET_USER_GRAPH_DEFAULTS_SUCCESS
} from "../actions";

const initialState = [];

export default function (state = initialState, action) {
  switch (action.type) {
    case RESET_USER_GRAPH_DEFAULTS_SUCCESS:
      return initialState;
    case LOAD_USER_DEFAULT_GRAPHS_SUCCESS:
      return action.payload;

    default:
      return state;
  }
}
