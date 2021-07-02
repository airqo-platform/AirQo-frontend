import { combineReducers } from "redux";
import authReducer from "./Join/reducers/authReducer";
import errorReducer from "./Join/reducers/errorReducer";
import userReducer from "./Join/reducers/userReducer";
import mapReducer from "./Maps/reducers";
import dashboardReducer from "./Dashboard/reducers/dashboardReducer";
import orgReducer from "./Join/reducers/orgReducer";
import deviceRegistryReducer from "./DeviceRegistry/reducers";
import mainAlertReducer from "./MainAlert/reducers";
import mapDataReducer from "./MapData/reducers";
import deviceManagementReducer from "./DeviceManagement/reducers";
import userPreferenceReducer from "./UserPreference/reducer";
import urlsReducer from "./Urls/reducers";
import siteRegistryReducer from "./SiteRegistry/reducers";

export default combineReducers({
  auth: authReducer,
  errors: errorReducer,
  userState: userReducer,
  mapDefaults: mapReducer,
  dashboard: dashboardReducer,
  organisation: orgReducer,
  deviceManagement: deviceManagementReducer,
  deviceRegistry: deviceRegistryReducer,
  mainAlert: mainAlertReducer,
  mapData: mapDataReducer,
  userPreference: userPreferenceReducer,
  urls: urlsReducer,
  siteRegistry: siteRegistryReducer,
});
