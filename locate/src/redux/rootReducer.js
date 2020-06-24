import { combineReducers } from "redux";
import alertsReducer from "./IncidentReport/reducers/alertsReducer";
import issuesReducer from "./IncidentReport/reducers/issuesReducer";
import authReducer from "./Join/reducers/authReducer";
import errorReducer from "./Join/reducers/errorReducer";
import mapsReducer from "./Maps/reducers";

export default combineReducers({
  alerts: alertsReducer,
  issues: issuesReducer,
  auth: authReducer,
  errors: errorReducer,
  mapDefaults: mapsReducer,
});
