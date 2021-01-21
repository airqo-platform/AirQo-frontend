import { combineReducers } from "redux";
import deviceStatus from "./devicesStatus";
import devicesUptime from "./devicesUptime";
import networkUptime from "./networkUptime";

export default combineReducers({
  deviceStatus,
  devicesUptime,
  networkUptime,
});
