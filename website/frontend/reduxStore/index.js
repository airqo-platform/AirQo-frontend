import { combineReducers } from 'redux';
import airqloudsReducer from './AirQlouds/reducers';
import newsletterReducer from './Newsletter/reducers';
import getInvolvedReducer from './GetInvolved/reducers';
import exploreDataReducer from './ExploreData/reducers';
import careersReducer from './Careers/reducers';
import teamReducer from './Team/reducers'
import highlightsReducer from './Highlights/reducers'

export default combineReducers({
  airqlouds: airqloudsReducer,
  newsletter: newsletterReducer,
  getInvolved: getInvolvedReducer,
  exploreData: exploreDataReducer,
  careersData: careersReducer,
  teamData: teamReducer,
  highlightsData: highlightsReducer,
});
