import { combineReducers } from "redux";
import devices from "./device";
import maintenanceLogs from "./maintenanceLogs";


export default combineReducers({
    devices,
    maintenanceLogs,
});