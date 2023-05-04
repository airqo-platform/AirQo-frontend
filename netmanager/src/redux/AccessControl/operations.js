import { getNetworkUsersListApi, getUserRolesApi } from '../../views/apis/accessControl';
import {
  LOAD_ALL_USER_ROLES_FAILURE,
  LOAD_ALL_USER_ROLES_SUCCESS,
  LOAD_CURRENT_NETWORK_FAILURE,
  LOAD_CURRENT_NETWORK_SUCCESS,
  LOAD_CURRENT_USER_NETWORKS_SUCCESS,
  LOAD_CURRENT_USER_ROLE_SUCCESS
} from './actions';
import { isEmpty } from 'underscore';

export const loadUserRoles = () => async (dispatch) => {
  return await getUserRolesApi()
    .then((resData) => {
      if (isEmpty(resData.roles || [])) return;

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
      if (isEmpty(resData.users || [])) return;

      dispatch({
        type: LOAD_CURRENT_NETWORK_SUCCESS,
        payload: resData.users
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_CURRENT_NETWORK_FAILURE,
        payload: err
      });
    });
};
