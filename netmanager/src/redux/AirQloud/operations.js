import { CURRENT_AIRQLOUD_KEY } from 'config/localStorageKeys';
import {
  LOAD_ALL_AIRQLOUDS_SUCCESS,
  LOAD_ALL_AIRQLOUDS_FAILURE,
  SET_CURRENT_AIRQLOUD_SUCCESS,
  SET_CURRENT_AIRQLOUD_FAILURE,
  LOAD_DASHBOARD_AIRQLOUDS_SUCCESS,
  LOAD_DASHBOARD_AIRQLOUDS_FAILURE,
  LOAD_SELECTED_AIRQLOUD_SUCCESS,
  LOAD_SELECTED_AIRQLOUD_FAILURE,
  REMOVE_SELECTED_AIRQLOUD_SUCCESS,
  LOAD_AIRQLOUDS_SUMMARY_SUCCESS,
  LOAD_AIRQLOUDS_SUMMARY_FAILURE
} from './actions';
import { isEmpty } from 'underscore';
import {
  getAirQloudsApi,
  refreshAirQloudApi,
  getDashboardAirQloudsApi
} from 'views/apis/deviceRegistry';
import { transformArray } from '../utils';
import { createSiteOptions } from 'utils/sites';
import { updateMainAlert } from '../MainAlert/operations';
import { getAirqloudsSummaryApi } from '../../views/apis/deviceRegistry';

const createAirqloudSiteOptions = (airqloud) => {
  return { ...airqloud, siteOptions: createSiteOptions(airqloud.sites || []) };
};

export const loadAirQloudsData = (options) => async (dispatch) => {
  return await getAirQloudsApi({})
    .then((resData) => {
      if (isEmpty(resData.airqlouds || [])) return;
      dispatch({
        type: LOAD_ALL_AIRQLOUDS_SUCCESS,
        payload: transformArray(resData.airqlouds, '_id')
      });
      if (options && options.callable instanceof Function) options.callable();
    })
    .catch((err) => {
      dispatch({
        type: LOAD_ALL_AIRQLOUDS_FAILURE,
        payload: err
      });
      if (options && options.onerror instanceof Function) options.onerror();
    });
};

export const refreshAirQloud = (airQloudName, airQloudID) => async (dispatch) => {
  dispatch(
    updateMainAlert({
      severity: 'info',
      message: `Refreshing ${airQloudName} AirQloud`,
      show: true
    })
  );
  return await refreshAirQloudApi({ id: airQloudID })
    .then((data) => {
      dispatch(
        updateMainAlert({
          severity: 'info',
          message: `Successfully refreshed ${airQloudName} AirQloud. Re-loading AirQlouds`,
          show: true
        })
      );
      dispatch(
        loadAirQloudsData({
          callable: () =>
            dispatch(
              updateMainAlert({
                severity: 'success',
                message: 'Successfully re-loaded AirQlouds.',
                show: true
              })
            )
        })
      );
      return data;
    })
    .catch((err) => {
      console.log(err);
      dispatch(
        updateMainAlert({
          severity: 'error',
          message: `Could not refresh ${airQloudName} AirQloud`,
          show: true
        })
      );
    });
};

export const setCurrentAirQloudData = (airqloud) => (dispatch, getState) => {
  const tenant = getState().organisation.name;
  const newAirqloud = createAirqloudSiteOptions(airqloud);
  const currentAirqloudState = JSON.parse(localStorage[CURRENT_AIRQLOUD_KEY] || '{}');
  localStorage.setItem(
    CURRENT_AIRQLOUD_KEY,
    JSON.stringify({ ...currentAirqloudState, [tenant]: newAirqloud })
  );
  dispatch({
    type: SET_CURRENT_AIRQLOUD_SUCCESS,
    payload: createAirqloudSiteOptions(newAirqloud)
  });
};

export const setDefaultAirQloud = () => async (dispatch, getState) => {
  const tenant = getState().organisation.name;
  const airqloud = JSON.parse(localStorage[CURRENT_AIRQLOUD_KEY] || '{}')[tenant];
  if (airqloud) {
    dispatch({
      type: SET_CURRENT_AIRQLOUD_SUCCESS,
      payload: airqloud
    });
  } else {
    const { airqlouds } = await getAirQloudsApi({});
    if (isEmpty(airqlouds)) return;
    const current = airqlouds.filter((airqloud) => airqloud.long_name === 'Uganda');
    dispatch(setCurrentAirQloudData((current.length > 0 && current[0]) || airqlouds[0]));
    dispatch({
      type: LOAD_ALL_AIRQLOUDS_SUCCESS,
      payload: transformArray(airqlouds, '_id')
    });
  }
};

export const fetchDashboardAirQloudsData = (options) => async (dispatch) => {
  return await getDashboardAirQloudsApi()
    .then((resData) => {
      if (isEmpty(resData.airqlouds || [])) return;
      dispatch({
        type: LOAD_DASHBOARD_AIRQLOUDS_SUCCESS,
        payload: transformArray(resData.airqlouds, '_id')
      });
      if (options && options.callable instanceof Function) options.callable();
    })
    .catch((err) => {
      dispatch({
        type: LOAD_DASHBOARD_AIRQLOUDS_FAILURE,
        payload: err
      });
      if (options && options.onerror instanceof Function) options.onerror();
    });
};

export const getAirqloudDetails = (airQloudID) => async (dispatch) => {
  return await getAirQloudsApi({ id: airQloudID })
    .then((resData) => {
      dispatch({
        type: LOAD_SELECTED_AIRQLOUD_SUCCESS,
        payload: resData.airqlouds[0]
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_SELECTED_AIRQLOUD_FAILURE,
        payload: err
      });
    });
};

export const removeAirQloudData = () => (dispatch) => {
  dispatch({
    type: REMOVE_SELECTED_AIRQLOUD_SUCCESS,
    payload: {}
  });
};

export const fetchAirqloudsSummaryData = () => async (dispatch) => {
  return await getAirqloudsSummaryApi()
    .then((resData) => {
      dispatch({
        type: LOAD_AIRQLOUDS_SUMMARY_SUCCESS,
        payload: resData.airqlouds
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_AIRQLOUDS_SUMMARY_FAILURE,
        payload: err
      });
    });
};
