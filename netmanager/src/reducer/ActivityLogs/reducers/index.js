import { combineReducers } from 'redux';
import activities from './activities';
import activityOptions from './activityOptions';
import activitySummary from './activitySummary';

export default combineReducers({
  activities,
  activityOptions,
  activitySummary
});
