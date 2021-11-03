import { GET_ALL_REPORTS_DATA_SUCCESS } from "./actions";
import { LOGOUT_USER_SUCCESS } from "redux/Join/types";

const initialState = {
  reports: [],
};
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_ALL_REPORTS_DATA_SUCCESS:
      return { ...state, reports: action.payload };
    case LOGOUT_USER_SUCCESS:
      return initialState;
    default:
      return state;
  }
}
