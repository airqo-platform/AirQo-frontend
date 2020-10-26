import { combineReducers } from "redux";
import devices from "./device";
import maintenanceLogs from "./maintenanceLogs";
import components from "./components";


export default combineReducers({
    devices,
    maintenanceLogs,
    components,
});