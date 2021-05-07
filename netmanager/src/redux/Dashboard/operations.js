// for representing chained operations using redux-thunk
import axios from "axios";
import {
  REFRESH_FILTER_LOCATION_DATA_SUCCESS,
  REFRESH_FILTER_LOCATION_DATA_ERROR,
  LOAD_USER_DEFAULT_GRAPHS_SUCCESS,
  LOAD_USER_DEFAULT_GRAPHS_ERROR,
  SET_USER_DEFAULTS_GRAPHS_SUCCESS,
  SET_USER_DEFAULTS_GRAPHS_ERROR,
  RESET_USER_GRAPH_DEFAULTS_SUCCESS,
  RESET_LOCATION_FILTER_SUCCESS,
} from "./actions";
import { DEFAULTS_URI } from "config/urls/authService";
import { KCCAInitialUserDefaultGraphsState } from "./constants";
import { filterDefaults } from "./utils";
import { getMonitoringSitesLocationsApi } from "views/apis/location";

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
    const user = getState().auth.user._id;
    return await axios
      .get(DEFAULTS_URI, { params: { user } })
      .then((res) => res.data)
      .then((userDefaultsData) => {
        const { defaults } = userDefaultsData;
        dispatch({
          type: LOAD_USER_DEFAULT_GRAPHS_SUCCESS,
          payload: filterDefaults(defaults, KCCAInitialUserDefaultGraphsState),
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

export const resetDashboardState = () => dispatch => {
  dispatch({ type: RESET_LOCATION_FILTER_SUCCESS });
  dispatch({ type: RESET_USER_GRAPH_DEFAULTS_SUCCESS });
};
