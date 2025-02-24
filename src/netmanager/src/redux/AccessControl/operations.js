import {
  getAvailableNetworkUsersListApi,
  getNetworkUsersListApi,
  getRolesApi,
  getRolesSummaryApi
} from '../../views/apis/accessControl';
import {
  LOAD_ALL_USER_ROLES_FAILURE,
  LOAD_ALL_USER_ROLES_SUCCESS,
  LOAD_AVAILABLE_USERS_FAILURE,
  LOAD_AVAILABLE_USERS_SUCCESS,
  LOAD_CURRENT_NETWORK_SUCCESS,
  LOAD_CURRENT_USER_NETWORKS_SUCCESS,
  LOAD_CURRENT_USER_ROLE_SUCCESS,
  LOAD_NETWORK_USERS_FAILURE,
  LOAD_NETWORK_USERS_SUCCESS,
  LOAD_ROLES_SUMMARY_SUCCESS,
  LOAD_GROUPS_SUMMARY_SUCCESS
} from './actions';
import { isEmpty } from 'underscore';
import { updateMainAlert } from 'redux/MainAlert/operations';

export const loadUserRoles = (networkID) => async (dispatch) => {
  return await getRolesApi(networkID)
    .then((resData) => {
      dispatch({
        type: LOAD_ALL_USER_ROLES_SUCCESS,
        payload: resData.roles
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_ALL_USER_ROLES_FAILURE,
        payload: err
      });
    });
};

export const loadRolesSummary = (networkID) => async (dispatch) => {
  return await getRolesSummaryApi(networkID)
    .then((resData) => {
      dispatch({
        type: LOAD_ROLES_SUMMARY_SUCCESS,
        payload: resData.roles
      });
    })
    .catch((error) => {
      dispatch(
        updateMainAlert({
          message: error.response && error.response.data && error.response.data.message,
          show: true,
          severity: 'error'
        })
      );
    });
};

export const addCurrentUserRole = (data) => (dispatch) => {
  return dispatch({
    type: LOAD_CURRENT_USER_ROLE_SUCCESS,
    payload: data
  });
};

export const addUserNetworks = (data) => (dispatch) => {
  return dispatch({
    type: LOAD_CURRENT_USER_NETWORKS_SUCCESS,
    payload: data
  });
};

export const addActiveNetwork = (data) => (dispatch) => {
  return dispatch({
    type: LOAD_CURRENT_NETWORK_SUCCESS,
    payload: data
  });
};

export const fetchNetworkUsers = (networkId, params) => async (dispatch) => {
  try {
    dispatch({ type: 'SET_NETWORK_USERS_LOADING', payload: true });
    const resData = await getNetworkUsersListApi(networkId, params);
    dispatch({
      type: LOAD_NETWORK_USERS_SUCCESS,
      payload: {
        users: resData.assigned_users,
        total: resData.total_assigned_users
      }
    });
    return resData;
  } catch (err) {
    dispatch({
      type: LOAD_NETWORK_USERS_FAILURE,
      payload: err
    });
    throw err;
  } finally {
    dispatch({ type: 'SET_NETWORK_USERS_LOADING', payload: false });
  }
};

export const fetchAvailableNetworkUsers = (networkId, params) => async (dispatch) => {
  try {
    dispatch({ type: 'SET_AVAILABLE_USERS_LOADING', payload: true });
    const resData = await getAvailableNetworkUsersListApi(networkId, params);
    dispatch({
      type: LOAD_AVAILABLE_USERS_SUCCESS,
      payload: {
        users: resData.available_users,
        total: resData.total_available_users
      }
    });
    return resData;
  } catch (err) {
    dispatch({
      type: LOAD_AVAILABLE_USERS_FAILURE,
      payload: err
    });
    throw err;
  } finally {
    dispatch({ type: 'SET_AVAILABLE_USERS_LOADING', payload: false });
  }
};

export const addUserGroupSummary = (data) => (dispatch) => {
  return dispatch({
    type: LOAD_GROUPS_SUMMARY_SUCCESS,
    payload: data
  });
};
