import {
  getGridsAndCohortsSummaryApi,
  getGridDetailsApi,
  getCohortDetailsApi
} from 'views/apis/deviceRegistry';
import {
  ADD_POLYGON_SHAPE_SUCCESS,
  LOAD_ACTIVE_COHORT_DETAILS_FAILURE,
  LOAD_ACTIVE_COHORT_DETAILS_SUCCESS,
  LOAD_ACTIVE_COHORT_SUCCESS,
  LOAD_ACTIVE_GRID_DETAILS_FAILURE,
  LOAD_ACTIVE_GRID_DETAILS_SUCCESS,
  LOAD_ACTIVE_GRID_SUCCESS,
  LOAD_COMBINED_GRIDS_AND_COHORTS_SUMMARY_FAILURE,
  LOAD_COMBINED_GRIDS_AND_COHORTS_SUMMARY_SUCCESS
} from './actions';
import { isEmpty } from 'underscore';

export const loadGridsAndCohortsSummary = (network_name) => async (dispatch) => {
  return await getGridsAndCohortsSummaryApi(network_name)
    .then((resData) => {
      dispatch({
        type: LOAD_COMBINED_GRIDS_AND_COHORTS_SUMMARY_SUCCESS,
        payload: resData.airqlouds
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_COMBINED_GRIDS_AND_COHORTS_SUMMARY_FAILURE,
        payload: err
      });
    });
};

export const setActiveGrid = (grid) => (dispatch) => {
  dispatch({
    type: LOAD_ACTIVE_GRID_SUCCESS,
    payload: grid
  });
};

export const loadGridDetails = (gridID) => (dispatch) => {
  return getGridDetailsApi(gridID)
    .then((resData) => {
      dispatch({
        type: LOAD_ACTIVE_GRID_DETAILS_SUCCESS,
        payload: resData.grids[0] && !isEmpty(resData.grids[0].sites) ? resData.grids[0] : []
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_ACTIVE_GRID_DETAILS_FAILURE,
        payload: err
      });
    });
};

export const setActiveCohort = (cohort) => (dispatch) => {
  dispatch({
    type: LOAD_ACTIVE_COHORT_SUCCESS,
    payload: cohort
  });
};

export const loadCohortDetails = (cohortID) => async (dispatch) => {
  return await getCohortDetailsApi(cohortID)
    .then((resData) => {
      dispatch({
        type: LOAD_ACTIVE_COHORT_DETAILS_SUCCESS,
        payload: resData.cohorts[0] || {}
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_ACTIVE_COHORT_DETAILS_FAILURE,
        payload: err
      });
    });
};

export const loadPolygon = (shape) => (dispatch) => {
  dispatch({
    type: ADD_POLYGON_SHAPE_SUCCESS,
    payload: shape
  });
};
