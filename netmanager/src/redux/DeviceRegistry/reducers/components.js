import {
  INSERT_NEW_COMPONENT_SUCCESS,
  LOAD_DEVICE_COMPONENTS_SUCCESS,
  RESET_DEVICE_COMPONENTS_SUCCESS,
  UPDATE_SINGLE_COMPONENT_SUCCESS,
} from "../actions";

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case RESET_DEVICE_COMPONENTS_SUCCESS:
      return initialState;
    case LOAD_DEVICE_COMPONENTS_SUCCESS:
      return { ...state, ...action.payload };
    case INSERT_NEW_COMPONENT_SUCCESS:
      return {
        ...state,
        [action.payload.deviceName]: [
          action.payload.component,
          ...(state[action.payload.deviceName] || []),
        ],
      };
    case UPDATE_SINGLE_COMPONENT_SUCCESS:
      return {
        ...state,
        [action.payload.deviceName]: [
          ...(state[action.payload.deviceName] || []).slice(
            0,
            action.payload.index
          ),
          action.payload.component,
          ...(state[action.payload.deviceName] || []).slice(
            action.payload.index + 1
          ),
        ],
      };
    default:
      return state;
  }
}
