import { CLEAR_ERRORS, GET_ERRORS } from "../types";
const initialState = {
  errors: null,
};
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_ERRORS:
      return action.payload;
    case CLEAR_ERRORS:
      return initialState;
    default:
      return state;
  }
}
