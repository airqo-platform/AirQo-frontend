import { combineReducers } from 'redux';
import userDefaultGraphsReducer from './userDefaultGraphsReducer';
import sitesReducer from './sitesReducer';

export default combineReducers({
  userDefaultGraphs: userDefaultGraphsReducer,
  sitesData: sitesReducer
});
