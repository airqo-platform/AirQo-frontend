import {
  SET_CURRENT_USER_REQUEST,
  SET_CURRENT_USER_SUCCESS,
  SET_CURRENT_USER_FAILED,
  USER_LOADING,
  RESET_PWD_REQUEST,
  UPDATE_PWD_REQUEST,
} from "../types";
const isEmpty = require("is-empty");

const initialState = {
  isAuthenticated: false,
  user: {},
  recovery: "",
  loading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_USER_SUCCESS:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload,
      };
    case USER_LOADING:
      return {
        ...state,
        loading: true,
      };
    case RECOVERY_EMAIL_REQUEST:
      return {
        ...state,
        recovery: action.payload,
      };
    case RESET_PWD_REQUEST:
      return {
        ...state,
        reset: action.payload,
      };
    case UPDATE_PWD_REQUEST:
      return {
        ...state,
        update: action.payload,
      };
    case WELCOME_EMAIL_REQUEST:
      return {
        ...state,
        welcome: action.payload,
      };
    default:
      return state;
  }
}
