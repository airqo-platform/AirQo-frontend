import { LOAD_ALL_DEVICES_SUCCESS } from "../actions";

export default function (state = {}, action) {
  switch (action.type) {
    case LOAD_ALL_DEVICES_SUCCESS:
      return action.payload;
    default:
      return state;
  }
}