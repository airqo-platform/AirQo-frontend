import { LOAD_DEVICE_COMPONENTS_SUCCESS } from "../actions";

export default function (state = {}, action) {
  switch (action.type) {
    case LOAD_DEVICE_COMPONENTS_SUCCESS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
