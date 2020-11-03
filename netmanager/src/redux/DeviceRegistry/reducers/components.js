import { LOAD_DEVICE_COMPONENTS_SUCCESS, RESET_DEVICE_COMPONENTS_SUCCESS } from "../actions";

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case RESET_DEVICE_COMPONENTS_SUCCESS:
      return initialState;
    case LOAD_DEVICE_COMPONENTS_SUCCESS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
