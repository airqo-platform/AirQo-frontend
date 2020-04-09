import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import reducers from "../../Maps/reducers.js";
export default combineReducers({
  auth: authReducer,
  errors: errorReducer,
  mapDefaults: reducers,
});
