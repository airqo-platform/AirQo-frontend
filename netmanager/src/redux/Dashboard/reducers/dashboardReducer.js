import { combineReducers } from "redux";
import locationFilterReducer from "./locationFilterReducer";
import userDefaultGraphsReducer from "./userDefaultGraphsReducer";

export default combineReducers({
  filterLocationData: locationFilterReducer,
  userDefaultGraphs: userDefaultGraphsReducer,
});
