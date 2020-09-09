import { combineReducers } from "redux";
import locationFilterReducer from "./locationFilterReducer";

export default combineReducers({
  filterLocationData: locationFilterReducer,
});
