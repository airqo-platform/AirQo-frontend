export const LOAD_ALL_USER_ROLES_SUCCESS = 'LOAD_ALL_USER_ROLES_SUCCESS';
export const LOAD_ALL_USER_ROLES_FAILURE = 'LOAD_ALL_USER_ROLES_FAILURE';

export const LOAD_CURRENT_USER_ROLE_SUCCESS = 'LOAD_CURRENT_USER_ROLE_SUCCESS';
export const LOAD_CURRENT_USER_ROLE_FAILURE = 'LOAD_CURRENT_USER_ROLE_FAILURE';

export const LOAD_CURRENT_USER_NETWORKS_SUCCESS = 'LOAD_CURRENT_USER_NETWORKS_SUCCESS';
export const LOAD_CURRENT_USER_NETWORKS_FAILURE = 'LOAD_CURRENT_USER_NETWORKS_FAILURE';

export const LOAD_CURRENT_NETWORK_SUCCESS = 'LOAD_CURRENT_NETWORK_SUCCESS';
export const LOAD_CURRENT_NETWORK_FAILURE = 'LOAD_CURRENT_NETWORK_FAILURE';

export const LOAD_NETWORK_USERS_SUCCESS = 'LOAD_NETWORK_USERS_SUCCESS';
export const LOAD_NETWORK_USERS_FAILURE = 'LOAD_NETWORK_USERS_FAILURE';

export const LOAD_AVAILABLE_USERS_SUCCESS = 'LOAD_AVAILABLE_USERS_SUCCESS';
export const LOAD_AVAILABLE_USERS_FAILURE = 'LOAD_AVAILABLE_USERS_FAILURE';

export const LOAD_ROLES_SUMMARY_SUCCESS = 'LOAD_ROLES_SUMMARY_SUCCESS';
export const LOAD_ROLES_SUMMARY_FAILURE = 'LOAD_ROLES_SUMMARY_FAILURE';

export const LOAD_GROUPS_SUMMARY_SUCCESS = 'LOAD_GROUPS_SUMMARY_SUCCESS';
export const LOAD_GROUPS_SUMMARY_FAILURE = 'LOAD_GROUPS_SUMMARY_FAILURE';

// Groups Management Actions
export const LOAD_GROUPS_SUMMARY = 'LOAD_GROUPS_SUMMARY';
export const SET_ACTIVE_GROUP = 'SET_ACTIVE_GROUP';
export const LOAD_GROUP_DEVICES = 'LOAD_GROUP_DEVICES';
export const LOAD_GROUP_SITES = 'LOAD_GROUP_SITES';
export const LOAD_GROUP_USERS = 'LOAD_GROUP_USERS';
export const SET_GROUPS_LOADING = 'SET_GROUPS_LOADING';
export const SET_GROUPS_ERROR = 'SET_GROUPS_ERROR';

export const LOAD_GROUP_COHORTS = 'LOAD_GROUP_COHORTS';

// Action Creators
export const loadGroupsSummary = (groups) => ({
  type: LOAD_GROUPS_SUMMARY,
  payload: groups
});

export const setActiveGroup = (group) => ({
  type: SET_ACTIVE_GROUP,
  payload: group
});

export const loadGroupDevices = (devices) => ({
  type: LOAD_GROUP_DEVICES,
  payload: devices
});

export const loadGroupSites = (sites) => ({
  type: LOAD_GROUP_SITES,
  payload: sites
});

export const loadGroupUsers = (users) => ({
  type: LOAD_GROUP_USERS,
  payload: users
});

export const setGroupsLoading = (loading) => ({
  type: SET_GROUPS_LOADING,
  payload: loading
});

export const setGroupsError = (error) => ({
  type: SET_GROUPS_ERROR,
  payload: error
});

export const loadGroupCohorts = (cohorts) => ({
  type: LOAD_GROUP_COHORTS,
  payload: cohorts
});
