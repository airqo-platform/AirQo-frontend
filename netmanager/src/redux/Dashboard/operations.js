// for representing chained operations using redux-thunk
import axios from "axios";
import { isEmpty } from "underscore";
import {
  REFRESH_FILTER_LOCATION_DATA_SUCCESS,
  REFRESH_FILTER_LOCATION_DATA_ERROR,
  LOAD_USER_DEFAULT_GRAPHS_SUCCESS,
  LOAD_USER_DEFAULT_GRAPHS_ERROR,
  SET_USER_DEFAULTS_GRAPHS_SUCCESS,
  SET_USER_DEFAULTS_GRAPHS_ERROR,
  RESET_USER_GRAPH_DEFAULTS_SUCCESS,
  RESET_LOCATION_FILTER_SUCCESS,
  LOAD_DASHBOARD_SITES_SUCCESS,
  LOAD_DASHBOARD_SITES_FAILURE,
  UPDATE_USER_DEFAULT_GRAPHS_SUCCESS,
  UPDATE_USER_DEFAULT_GRAPHS_FAILURE,
} from "./actions";
import { DEFAULTS_URI } from "config/urls/authService";
import { getMonitoringSitesLocationsApi } from "views/apis/location";
import { getUserChartDefaultsApi } from "views/apis/authService";
import { getSitesApi } from "views/apis/analytics";

export const loadSites = () => async (dispatch) => {
  return await getSitesApi()
    .then((res) => {
      if (isEmpty(res.data)) return;
      dispatch({
        type: LOAD_DASHBOARD_SITES_SUCCESS,
        payload: res.data || [],
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_DASHBOARD_SITES_FAILURE,
        payload: err,
      });
    });
};

export const refreshFilterLocationData = () => {
  return async (dispatch) => {
    return await getMonitoringSitesLocationsApi()
      .then((responseData) => {
        dispatch({
          type: REFRESH_FILTER_LOCATION_DATA_SUCCESS,
          payload: responseData.airquality_monitoring_sites,
        });
      })
      .catch((err) => {
        dispatch({
          type: REFRESH_FILTER_LOCATION_DATA_ERROR,
          payload: err,
        });
      });
  };
};

export const loadUserDefaultGraphData = () => {
  return async (dispatch, getState) => {
    const userID = getState().auth.user._id;
    const airQloudID = getState().airqloudRegistry.currentAirQloud._id;

    return await getUserChartDefaultsApi(userID, airQloudID)
      .then(async (userDefaultsData) => {
        let data = userDefaultsData;

        if (isEmpty(data.defaults)) {
          data = await getUserChartDefaultsApi(userID, userID);
        }
        dispatch({
          type: LOAD_USER_DEFAULT_GRAPHS_SUCCESS,
          payload: data.defaults || [],
        });
      })
      .catch((err) => {
        dispatch({
          type: LOAD_USER_DEFAULT_GRAPHS_ERROR,
          payload: err,
        });
      });
  };
};

export const setUserDefaultGraphData = (filter) => {
  return async (dispatch, getState) => {
    const user = getState().auth.user._id;
    const { chartTitle } = filter;
    return await axios
      .put(DEFAULTS_URI, filter, {
        params: { user, chartTitle },
      })
      .then((res) => res.data)
      .then((responseData) => {
        dispatch({
          type: SET_USER_DEFAULTS_GRAPHS_SUCCESS,
          payload: responseData,
        });
      })
      .catch((err) => {
        dispatch({
          type: SET_USER_DEFAULTS_GRAPHS_ERROR,
          payload: err,
        });
      });
  };
};

export const updateUserDefaultGraphData = (newChartDefault) => (dispatch) => {
  return dispatch({
    type: UPDATE_USER_DEFAULT_GRAPHS_SUCCESS,
    payload: newChartDefault,
  });
};

export const resetDashboardState = () => (dispatch) => {
  dispatch({ type: RESET_LOCATION_FILTER_SUCCESS });
  dispatch({ type: RESET_USER_GRAPH_DEFAULTS_SUCCESS });
};
