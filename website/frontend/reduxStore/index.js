import { combineReducers } from '@reduxjs/toolkit';
import airqloudsReducer from './AirQlouds/reducers';
import newsletterReducer from './Newsletter/reducers';
import getInvolvedReducer from './GetInvolved/reducers';
import exploreDataReducer from './ExploreData/reducers';
import careersReducer from './Careers/reducers';
import teamReducer from './Team/reducers';
import highlightsReducer from './Highlights/reducers';
import partnersReducer from './Partners/reducers';
import boardReducer from './Board/reducers';
import publicationsReducer from './Publications/reducers';
import pressReducer from './Press/PressSlice';
import EventsNavTabReducer from './EventsNav/NavigationSlice';
import EventsReducer from './Events/EventSlice';
import CitiesReducer from './AfricanCities/CitiesSlice';
import ImpactReducer from './ImpactNumbers/ImpactSlice'

export default combineReducers({
  airqlouds: airqloudsReducer,
  newsletter: newsletterReducer,
  getInvolved: getInvolvedReducer,
  exploreData: exploreDataReducer,
  careersData: careersReducer,
  teamData: teamReducer,
  highlightsData: highlightsReducer,
  partnersData: partnersReducer,
  boardData: boardReducer,
  publicationsData: publicationsReducer,
  pressData: pressReducer,
  eventsNavTab: EventsNavTabReducer,
  eventsData: EventsReducer,
  citiesData: CitiesReducer,
  impactData: ImpactReducer
});
