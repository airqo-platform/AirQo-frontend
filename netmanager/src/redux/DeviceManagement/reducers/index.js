import { combineReducers } from "redux";
import deviceStatus from "./devicesStatus";
import networkUptime from "./networkUptime";

export default combineReducers({
  deviceStatus,
  networkUptime,
});
