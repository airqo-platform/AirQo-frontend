import { combineReducers } from 'redux';
import airQloudReducer from './AirQloud/reducers';

export default combineReducers({
  airqloudRegistry: airQloudReducer,
});
