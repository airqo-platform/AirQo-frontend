import { LOGOUT_USER_SUCCESS } from "redux/Join/types";
import { LOAD_UPTIME_LEADERBOARD_SUCCESS } from "../actions";

const initialState = [];

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_UPTIME_LEADERBOARD_SUCCESS:
      return action.payload;

    case LOGOUT_USER_SUCCESS:
      return initialState;

    default:
      return state;
  }
}
