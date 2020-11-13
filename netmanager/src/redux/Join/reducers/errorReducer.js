import { CLEAR_ERRORS, GET_ERRORS, RESET_ERRORS_SUCCESS } from "../types";
const initialState = {
  errors: null,
};
export default function (state = initialState, action) {
  switch (action.type) {
    case RESET_ERRORS_SUCCESS:
      return initialState;

    case GET_ERRORS:
      return action.payload;

    case CLEAR_ERRORS:
      return initialState;

    default:
      return state;
  }
}
