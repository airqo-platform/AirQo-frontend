import { LOGOUT_USER_SUCCESS } from 'redux/Join/types';
import {
  LOAD_ALL_AIRQLOUDS_SUCCESS,
  LOAD_COMBINED_GRIDS_AND_COHORTS_SUMMARY_SUCCESS,
  LOAD_DASHBOARD_AIRQLOUDS_SUCCESS,
  LOAD_SELECTED_AIRQLOUD_SUCCESS,
  REMOVE_SELECTED_AIRQLOUD_SUCCESS,
  SET_CURRENT_AIRQLOUD_SUCCESS
} from './actions';

const initialState = {
  airqlouds: {},
  currentAirQloud: {
    _id: '61363c2c7e130a001e03949f',
    name: 'Empty',
    long_name: 'Empty',
    sites: [],
    siteOptions: []
  },
  dashboardAirQlouds: {},
  selectedAirqloud: {},
  combinedGridAndCohortsSummary: {},
  selectedGridAndCohort: {}
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOGOUT_USER_SUCCESS:
      return initialState;

    case LOAD_ALL_AIRQLOUDS_SUCCESS:
      return { ...state, airqlouds: action.payload };

    case SET_CURRENT_AIRQLOUD_SUCCESS:
      return { ...state, currentAirQloud: action.payload };

    case LOAD_DASHBOARD_AIRQLOUDS_SUCCESS:
      return { ...state, dashboardAirQlouds: action.payload };

    case LOAD_SELECTED_AIRQLOUD_SUCCESS:
      return { ...state, selectedAirqloud: action.payload };

    case REMOVE_SELECTED_AIRQLOUD_SUCCESS:
      return { ...state, selectedAirqloud: action.payload };

    case LOAD_COMBINED_GRIDS_AND_COHORTS_SUMMARY_SUCCESS:
      return { ...state, combinedGridAndCohortsSummary: action.payload };

    default:
      return state;
  }
}
