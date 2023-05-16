import {
  getNetworkUsersListApi,
  getRolesApi,
  getRolesSummaryApi
} from '../../views/apis/accessControl';
import {
  LOAD_ALL_USER_ROLES_FAILURE,
  LOAD_ALL_USER_ROLES_SUCCESS,
  LOAD_CURRENT_NETWORK_SUCCESS,
  LOAD_CURRENT_USER_NETWORKS_SUCCESS,
  LOAD_CURRENT_USER_ROLE_SUCCESS,
  LOAD_NETWORK_USERS_FAILURE,
  LOAD_NETWORK_USERS_SUCCESS,
  LOAD_ROLES_SUMMARY_FAILURE,
  LOAD_ROLES_SUMMARY_SUCCESS
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

export const fetchNetworkUsers = (networkId) => async (dispatch) => {
  return await getNetworkUsersListApi(networkId)
    .then((resData) => {
      dispatch({
        type: LOAD_NETWORK_USERS_SUCCESS,
        payload: resData.assigned_users
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_NETWORK_USERS_FAILURE,
        payload: err
      });
    });
};
