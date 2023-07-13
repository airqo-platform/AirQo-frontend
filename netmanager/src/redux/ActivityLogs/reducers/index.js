import { combineReducers } from 'redux';
import activities from './activities';
import activityOptions from './activityOptions';
import activitySummary from './activitySummary';
import activityDetails from './activityDetails';

export default combineReducers({
  activities,
  activityOptions,
  activitySummary,
  activityDetails
});
