import { combineReducers } from "redux";
import authReducer from "./Join/reducers/authReducer";
import errorReducer from "./Join/reducers/errorReducer";
import userReducer from "./Join/reducers/userReducer";
import mapReducer from "./Maps/reducers";
import dashboardReducer from "./Dashboard/reducers/dashboardReducer";

export default combineReducers({
  auth: authReducer,
  errors: errorReducer,
  userState: userReducer,
  mapDefaults: mapReducer,
  dashboard: dashboardReducer,
});
