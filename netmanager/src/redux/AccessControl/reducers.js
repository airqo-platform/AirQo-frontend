import {
  ASSIGN_USER_TO_NETWORK_SUCCESS,
  LOAD_ALL_USER_ROLES_SUCCESS,
  LOAD_AVAILABLE_USERS_SUCCESS,
  LOAD_CURRENT_NETWORK_SUCCESS,
  LOAD_CURRENT_USER_NETWORKS_SUCCESS,
  LOAD_CURRENT_USER_ROLE_SUCCESS,
  LOAD_GROUPS_SUMMARY,
  LOAD_NETWORK_USERS_SUCCESS,
  LOAD_ROLES_SUMMARY_SUCCESS,
  SET_ACTIVE_GROUP,
  LOAD_GROUP_DEVICES,
  LOAD_GROUP_SITES,
  LOAD_GROUP_USERS,
  SET_GROUPS_LOADING,
  SET_GROUPS_ERROR
} from './actions';

const initialState = {
  userRoles: null,
  currentRole: {},
  userNetworks: null,
  activeNetwork: {},
  networkUsers: {
    users: null,
    total: 0,
    loading: false
  },
  rolesSummary: null,
  availableUsers: {
    users: null,
    total: 0,
    loading: false
  },
  groupsSummary: null,
  groups: {
    summary: [],
    activeGroup: null,
    groupDevices: [],
    groupSites: [],
    groupUsers: [],
    loading: false,
    error: null
  }
};

export default function accessControlReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_ALL_USER_ROLES_SUCCESS:
      return { ...state, userRoles: action.payload };
    case LOAD_CURRENT_USER_ROLE_SUCCESS:
      return { ...state, currentRole: action.payload };
    case LOAD_CURRENT_USER_NETWORKS_SUCCESS:
      return { ...state, userNetworks: action.payload };
    case LOAD_CURRENT_NETWORK_SUCCESS:
      return { ...state, activeNetwork: action.payload };
    case LOAD_NETWORK_USERS_SUCCESS:
      return {
        ...state,
        networkUsers: {
          users: action.payload.users,
          total: action.payload.total
        }
      };
    case LOAD_ROLES_SUMMARY_SUCCESS:
      return { ...state, rolesSummary: action.payload };
    case LOAD_AVAILABLE_USERS_SUCCESS:
      return {
        ...state,
        availableUsers: {
          users: action.payload.users,
          total: action.payload.total
        }
      };
    case LOAD_GROUPS_SUMMARY:
      return {
        ...state,
        groups: {
          ...state.groups,
          summary: action.payload
        }
      };
    case SET_ACTIVE_GROUP:
      return {
        ...state,
        groups: {
          ...state.groups,
          activeGroup: action.payload
        }
      };
    case LOAD_GROUP_DEVICES:
      return {
        ...state,
        groups: {
          ...state.groups,
          groupDevices: action.payload
        }
      };
    case LOAD_GROUP_SITES:
      return {
        ...state,
        groups: {
          ...state.groups,
          groupSites: action.payload
        }
      };
    case LOAD_GROUP_USERS:
      return {
        ...state,
        groups: {
          ...state.groups,
          groupUsers: action.payload
        }
      };
    case SET_GROUPS_LOADING:
      return {
        ...state,
        groups: {
          ...state.groups,
          loading: action.payload
        }
      };
    case SET_GROUPS_ERROR:
      return {
        ...state,
        groups: {
          ...state.groups,
          error: action.payload
        }
      };
    case 'SET_NETWORK_USERS_LOADING':
      return {
        ...state,
        networkUsers: {
          ...state.networkUsers,
          loading: action.payload
        }
      };
    case 'SET_AVAILABLE_USERS_LOADING':
      return {
        ...state,
        availableUsers: {
          ...state.availableUsers,
          loading: action.payload
        }
      };
    default:
      return state;
  }
}
