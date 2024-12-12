import {
  getAvailableNetworkUsersListApi,
  getNetworkUsersListApi,
  getRolesApi,
  getRolesSummaryApi,
  getGroupsSummaryApi,
  getGroupDevicesApi,
  getGroupSitesApi,
  getGroupUsersApi,
  getGroupDetailsApi,
  getGroupCohortsApi
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
  LOAD_GROUPS_SUMMARY_SUCCESS,
  loadGroupsSummary,
  loadGroupDevices,
  setGroupsLoading,
  setGroupsError,
  loadGroupSites,
  loadGroupUsers,
  setActiveGroup,
  loadGroupCohorts
} from './actions';
import { isEmpty } from 'underscore';
import { updateMainAlert } from 'redux/MainAlert/operations';
import axios from 'axios';

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

export const fetchGroupsSummary = () => async (dispatch) => {
  dispatch(setGroupsLoading(true));
  try {
    const response = await getGroupsSummaryApi();
    dispatch(loadGroupsSummary(response.groups));
  } catch (error) {
    dispatch(setGroupsError(error.message));
    dispatch(
      updateMainAlert({
        message: error.response?.data?.message || 'Failed to load groups',
        show: true,
        severity: 'error'
      })
    );
  } finally {
    dispatch(setGroupsLoading(false));
  }
};

export const fetchGroupDevices = (groupId) => async (dispatch) => {
  dispatch(setGroupsLoading(true));
  try {
    const response = await getGroupDevicesApi(groupId);
    dispatch(loadGroupDevices(response.devices));
  } catch (error) {
    dispatch(setGroupsError(error.message));
    dispatch(
      updateMainAlert({
        message: error.response?.data?.message || 'Failed to load group devices',
        show: true,
        severity: 'error'
      })
    );
  } finally {
    dispatch(setGroupsLoading(false));
  }
};

export const fetchGroupSites = (groupId) => async (dispatch) => {
  dispatch(setGroupsLoading(true));
  try {
    const response = await getGroupSitesApi(groupId);
    dispatch(loadGroupSites(response.sites));
  } catch (error) {
    dispatch(setGroupsError(error.message));
    dispatch(
      updateMainAlert({
        message: error.response?.data?.message || 'Failed to load group sites',
        show: true,
        severity: 'error'
      })
    );
  } finally {
    dispatch(setGroupsLoading(false));
  }
};

export const fetchGroupUsers = (groupId) => async (dispatch) => {
  dispatch(setGroupsLoading(true));
  try {
    const response = await getGroupUsersApi(groupId);
    dispatch(loadGroupUsers(response));
  } catch (error) {
    dispatch(setGroupsError(error.message));
    dispatch(
      updateMainAlert({
        message: error.response?.data?.message || 'Failed to load group users',
        show: true,
        severity: 'error'
      })
    );
  } finally {
    dispatch(setGroupsLoading(false));
  }
};

export const fetchGroupDetails = (groupId) => async (dispatch) => {
  dispatch(setGroupsLoading(true));
  try {
    const response = await getGroupDetailsApi(groupId);
    dispatch(setActiveGroup(response.group));
  } catch (error) {
    dispatch(setGroupsError(error.message));
    dispatch(
      updateMainAlert({
        message: error.response?.data?.message || 'Failed to load group details',
        show: true,
        severity: 'error'
      })
    );
  } finally {
    dispatch(setGroupsLoading(false));
  }
};

export const fetchGroupCohorts = (groupName) => async (dispatch) => {
  dispatch(setGroupsLoading(true));
  try {
    const response = await getGroupCohortsApi(groupName);
    dispatch(loadGroupCohorts(response.cohorts));
  } catch (error) {
    dispatch(setGroupsError(error.message));
    dispatch(
      updateMainAlert({
        message: error.response?.data?.message || 'Failed to load group cohorts',
        show: true,
        severity: 'error'
      })
    );
  } finally {
    dispatch(setGroupsLoading(false));
  }
};

export const loadGroupDetails = (groupId) => async (dispatch, getState) => {
  dispatch(setGroupsLoading(true));
  try {
    // First fetch the group details
    await dispatch(fetchGroupDetails(groupId));

    // Get the active group from the state
    const state = getState();
    const activeGroup = state.accessControl.groups.activeGroup;

    if (!activeGroup) {
      throw new Error('Failed to load group details');
    }

    // Then fetch all assignments in parallel using the group title
    await Promise.all([
      dispatch(fetchGroupDevices(activeGroup.grp_title)),
      dispatch(fetchGroupSites(activeGroup.grp_title)),
      dispatch(fetchGroupUsers(groupId)),
      dispatch(fetchGroupCohorts(activeGroup.grp_title))
    ]);
  } catch (error) {
    dispatch(setGroupsError(error.message));
    dispatch(
      updateMainAlert({
        message: error.response?.data?.message || 'Failed to load group information',
        show: true,
        severity: 'error'
      })
    );
  } finally {
    dispatch(setGroupsLoading(false));
  }
};
