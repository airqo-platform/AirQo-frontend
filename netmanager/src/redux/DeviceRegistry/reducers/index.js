import { combineReducers } from "redux";
import devices from "./device";
import maintenanceLogs from "./maintenanceLogs";
import components from "./components";
import upTime from "./uptime";

export default combineReducers({
  devices,
  maintenanceLogs,
  components,
  upTime,
});
