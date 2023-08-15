import { getGridsAndCohortsSummaryApi, getGridDetailsApi } from 'views/apis/deviceRegistry';
import {
  LOAD_ACTIVE_GRID_DETAILS_FAILURE,
  LOAD_ACTIVE_GRID_DETAILS_SUCCESS,
  LOAD_ACTIVE_GRID_SUCCESS,
  LOAD_COMBINED_GRIDS_AND_COHORTS_SUMMARY_FAILURE,
  LOAD_COMBINED_GRIDS_AND_COHORTS_SUMMARY_SUCCESS
} from './actions';

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

export const loadGridDetails = (gridID) => async (dispatch) => {
  return await getGridDetailsApi(gridID)
    .then((resData) => {
      dispatch({
        type: LOAD_ACTIVE_GRID_DETAILS_SUCCESS,
        payload: resData.grids[0]
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_ACTIVE_GRID_DETAILS_FAILURE,
        payload: err
      });
    });
};
