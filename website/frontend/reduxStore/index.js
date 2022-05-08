import { combineReducers } from 'redux';
import airqloudsReducer from './AirQlouds/reducers';

export default combineReducers({
  airqlouds: airqloudsReducer,
});
