import { LOAD_USER_DEFAULT_GRAPHS_SUCCESS } from "../actions";

export default function (state = [], action) {
  switch (action.type) {
    case LOAD_USER_DEFAULT_GRAPHS_SUCCESS:
      return action.payload;

    default:
      return state;
  }
}
