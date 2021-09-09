import { combineReducers } from "redux";
import deviceStatus from "./devicesStatus";
import devicesUptime from "./devicesUptime";
import networkUptime from "./networkUptime";
import uptimeLeaderboard from "./uptimeLeaderboard";

export default combineReducers({
  deviceStatus,
  devicesUptime,
  networkUptime,
  uptimeLeaderboard,
});
