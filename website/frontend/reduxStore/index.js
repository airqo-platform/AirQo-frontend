import { combineReducers } from 'redux';
import airqloudsReducer from './AirQlouds/reducers';
import newsletterReducer from './Newsletter/reducers';

export default combineReducers({
  airqlouds: airqloudsReducer,
  newsletter: newsletterReducer,
});
