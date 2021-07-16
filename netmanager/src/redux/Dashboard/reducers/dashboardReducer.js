import { combineReducers } from "redux";
import locationFilterReducer from "./locationFilterReducer";
import userDefaultGraphsReducer from "./userDefaultGraphsReducer";
import sitesReducer from "./sitesReducer";

export default combineReducers({
  filterLocationData: locationFilterReducer,
  userDefaultGraphs: userDefaultGraphsReducer,
  sitesData: sitesReducer,
});
