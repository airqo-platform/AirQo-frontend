import { isEmpty } from 'underscore';
import { getAirQloudSummaryApi } from 'apis';
import {
  LOAD_AIRQLOUDS_SUMMARY_SUCCESS,
  LOAD_AIRQLOUDS_SUMMARY_FAILURE,
  SET_CURRENT_AIRQLOUD_SUCCESS,
  SET_CURRENT_AIRQLOUD_FAILURE,
} from './actions';
import { transformArray } from '../utils';

export const setCurrentAirQloudData = (name) => (dispatch) => {
  dispatch(
    {
      type: SET_CURRENT_AIRQLOUD_SUCCESS,
      payload: name,
    },
  );
};

export const loadAirQloudSummaryData = () => async (dispatch) => await getAirQloudSummaryApi()
  .then((resData) => {
    if (isEmpty(resData.airqlouds || [])) return;
    dispatch({
      type: LOAD_AIRQLOUDS_SUMMARY_SUCCESS,
      payload: transformArray(resData.airqlouds, 'long_name'),
    });
  })
  .catch((err) => {
    dispatch({
      type: LOAD_AIRQLOUDS_SUMMARY_FAILURE,
      payload: err && err.message,
    });
  });
