import { combineReducers } from "redux";
import alertsReducer from "./alertsReducer";
import issuesReducer from "./issuesReducer";
export default combineReducers({
  alerts: alertsReducer,
  issues: issuesReducer,
});
