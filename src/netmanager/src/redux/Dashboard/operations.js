// for representing chained operations using redux-thunk
import createAxiosInstance from '../../views/apis/axiosConfig';
import { isEmpty } from 'underscore';
import {
  LOAD_USER_DEFAULT_GRAPHS_SUCCESS,
  LOAD_USER_DEFAULT_GRAPHS_ERROR,
  SET_USER_DEFAULTS_GRAPHS_SUCCESS,
  SET_USER_DEFAULTS_GRAPHS_ERROR,
  RESET_USER_GRAPH_DEFAULTS_SUCCESS,
  RESET_LOCATION_FILTER_SUCCESS,
  LOAD_DASHBOARD_SITES_SUCCESS,
  LOAD_DASHBOARD_SITES_FAILURE,
  UPDATE_USER_DEFAULT_GRAPHS_SUCCESS,
  UPDATE_USER_DEFAULT_GRAPHS_FAILURE
} from './actions';
import { DEFAULTS_URI } from 'config/urls/authService';
import { getUserChartDefaultsApi } from 'views/apis/authService';
import { getSitesApi } from 'views/apis/analytics';
import { transformArray } from '../utils';

export const loadSites = (networkID) => async (dispatch) => {
  return await getSitesApi(networkID)
    .then((res) => {
      if (isEmpty(res.data)) return;
      dispatch({
        type: LOAD_DASHBOARD_SITES_SUCCESS,
        payload: transformArray(res.data || [], '_id')
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_DASHBOARD_SITES_FAILURE,
        payload: err
      });
    });
};

export const loadUserDefaultGraphData = (isGrids, gridID) => {
  return async (dispatch, getState) => {
    const userID = getState().auth.user._id;
    const airQloudID = isGrids ? gridID : getState().airqloudRegistry.currentAirQloud._id;

    return await getUserChartDefaultsApi(userID, airQloudID)
      .then(async (userDefaultsData) => {
        dispatch({
          type: LOAD_USER_DEFAULT_GRAPHS_SUCCESS,
          payload: userDefaultsData.defaults || []
        });
      })
      .catch((err) => {
        dispatch({
          type: LOAD_USER_DEFAULT_GRAPHS_ERROR,
          payload: err
        });
      });
  };
};

export const resetDefaultGraphData = () => (dispatch) => {
  dispatch({
    type: LOAD_USER_DEFAULT_GRAPHS_SUCCESS,
    payload: []
  });
  dispatch(loadUserDefaultGraphData());
};

export const setUserDefaultGraphData = (filter) => {
  return async (dispatch, getState) => {
    const user = getState().auth.user._id;
    const { chartTitle } = filter;
    return await createAxiosInstance()
      .put(DEFAULTS_URI, filter, {
        params: { user, chartTitle }
      })
      .then((res) => res.data)
      .then((responseData) => {
        dispatch({
          type: SET_USER_DEFAULTS_GRAPHS_SUCCESS,
          payload: responseData
        });
      })
      .catch((err) => {
        dispatch({
          type: SET_USER_DEFAULTS_GRAPHS_ERROR,
          payload: err
        });
      });
  };
};

export const updateUserDefaultGraphData = (newChartDefault) => (dispatch) => {
  return dispatch({
    type: UPDATE_USER_DEFAULT_GRAPHS_SUCCESS,
    payload: newChartDefault
  });
};

export const resetDashboardState = () => (dispatch) => {
  dispatch({ type: RESET_LOCATION_FILTER_SUCCESS });
  dispatch({ type: RESET_USER_GRAPH_DEFAULTS_SUCCESS });
};
