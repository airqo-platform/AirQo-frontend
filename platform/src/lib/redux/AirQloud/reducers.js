import { createAction, createReducer } from '@reduxjs/toolkit';

import { LOGOUT_USER_SUCCESS } from '../Join/types';
import {
  LOAD_ALL_AIRQLOUDS_SUCCESS,
  SET_CURRENT_AIRQLOUD_SUCCESS,
} from './actions';

const initialState = {
  airqlouds: {},
  currentAirQloud: {
    _id: '61363c2c7e130a001e03949f',
    name: 'Empty',
    long_name: 'Empty',
    sites: [],
    siteOptions: [],
  },
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOGOUT_USER_SUCCESS:
      return initialState;

    case LOAD_ALL_AIRQLOUDS_SUCCESS:
      return { ...state, airqlouds: action.payload };

    case SET_CURRENT_AIRQLOUD_SUCCESS:
      return { ...state, currentAirQloud: action.payload };

    default:
      return state;
  }
}

// actions
const LOAD_ALL_AIRQLOUDS_SUCCESS = createAction('LOAD_ALL_AIRQLOUDS_SUCCESS');
const LOAD_ALL_AIRQLOUDS_FAILURE = createAction('LOAD_ALL_AIRQLOUDS_FAILURE');
const SET_CURRENT_AIRQLOUD_SUCCESS = createAction(
  'SET_CURRENT_AIRQLOUD_SUCCESS',
);
const SET_CURRENT_AIRQLOUD_FAILURE = createAction(
  'SET_CURRENT_AIRQLOUD_FAILURE',
);

const airQloudsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(LOAD_ALL_AIRQLOUDS_SUCCESS, (state, action) => {
      state.airqlouds = action.payload;
    })
    .addCase(SET_CURRENT_AIRQLOUD_SUCCESS, (state, action) => {
      state.currentAirQloud = action.payload;
    })
    .addCase(LOGOUT_USER_SUCCESS, (state, action) => state);
});
