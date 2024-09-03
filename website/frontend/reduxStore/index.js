import airqloudSlice from './AirQlouds';
import newsLetterSlice from './Newsletter';
import getInvolvedSlice from './GetInvolved';
import exploreDataSlice from './ExploreData';
import careerSlice from './Careers';
import teamSlice from './Team';
import highLightSlice from './Highlights';
import partnersSlice from './Partners';
import boardSlice from './Board';
import publicationSlice from './Publications';
import pressReducer from './Press/PressSlice';
import EventsNavTabReducer from './EventsNav/NavigationSlice';
import EventsReducer from './Events';
import CitiesReducer from './AfricanCities';
import ImpactReducer from './ImpactNumbers/ImpactSlice';
import cleanAirSlice from './CleanAirNetwork';
import inquirySlice from './ContactUs';

const rootReducer = {
  airqlouds: airqloudSlice,
  newsletter: newsLetterSlice,
  getInvolved: getInvolvedSlice,
  exploreData: exploreDataSlice,
  careersData: careerSlice,
  teamData: teamSlice,
  inquiry: inquirySlice,
  highlightsData: highLightSlice,
  partnersData: partnersSlice,
  boardData: boardSlice,
  publicationsData: publicationSlice,
  pressData: pressReducer,
  eventsNavTab: EventsNavTabReducer,
  eventsData: EventsReducer,
  citiesData: CitiesReducer,
  impactData: ImpactReducer,
  cleanAirData: cleanAirSlice
};

export default rootReducer;
