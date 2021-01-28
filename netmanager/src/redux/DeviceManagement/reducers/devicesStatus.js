import { LOAD_DEVICES_STATUS_SUCCESS } from "../actions";

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_DEVICES_STATUS_SUCCESS:
      return action.payload;
    default:
      return state;
  }
}
