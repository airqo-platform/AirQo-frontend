import {
  GET_NETWORKS_URI,
  GET_PERMISSIONS_URI,
  GET_ROLES_URI,
  GENERATE_ACCESS_TOKEN,
  CREATE_TEAM_URI,
  GET_SIM_URI,
  GET_GROUPS_URI
} from '../../config/urls/analytics';
import { GET_ACCESS_TOKEN } from '../../config/urls/authService';
import { ALL_DEVICES_URI } from '../../config/urls/deviceRegistry';
import createAxiosInstance from './axiosConfig';

export const createAccessToken = async (data) => {
  return await createAxiosInstance()
    .post(GET_ACCESS_TOKEN, data)
    .then((response) => response.data);
};

export const getRolesApi = async (networkID) => {
  return await createAxiosInstance()
    .get(GET_ROLES_URI, { params: { network_id: networkID } })
    .then((response) => response.data);
};

export const getRolesSummaryApi = async (networkID) => {
  return await createAxiosInstance()
    .get(`${GET_ROLES_URI}/summary`, { params: { network_id: networkID } })
    .then((response) => response.data);
};

export const getUsersWithRole = async (roleID) => {
  return await createAxiosInstance()
    .get(`${GET_ROLES_URI}/${roleID}/users`)
    .then((response) => response.data);
};

export const addRoleApi = async (data) => {
  return await createAxiosInstance()
    .post(GET_ROLES_URI, data)
    .then((response) => response.data);
};

export const updateRoleApi = async (roleID, data) => {
  return await createAxiosInstance()
    .put(`${GET_ROLES_URI}/${roleID}`, data)
    .then((response) => response.data);
};

export const deleteRoleApi = async (roleID) => {
  return await createAxiosInstance()
    .delete(`${GET_ROLES_URI}/${roleID}`)
    .then((response) => response.data);
};

export const getRoleDetailsApi = async (roleID) => {
  return await createAxiosInstance()
    .get(`${GET_ROLES_URI}/${roleID}`)
    .then((response) => response.data);
};

export const assignUserToRoleApi = async (roleID, data) => {
  return await createAxiosInstance()
    .post(`${GET_ROLES_URI}/${roleID}/user`, data)
    .then((response) => response.data);
};

export const createNetworkApi = async (data) => {
  return await createAxiosInstance()
    .post(GET_NETWORKS_URI, data)
    .then((response) => response.data);
};

export const getNetworksApi = async () => {
  return await createAxiosInstance()
    .get(GET_NETWORKS_URI)
    .then((response) => response.data);
};

export const assignUserNetworkApi = async (networkID, userID) => {
  return await createAxiosInstance()
    .put(`${GET_NETWORKS_URI}/${networkID}/assign-user/${userID}`)
    .then((response) => response.data);
};

export const getAvailableNetworkUsersListApi = async (networkId, params = {}) => {
  return await createAxiosInstance()
    .get(`${GET_NETWORKS_URI}/${networkId}/available-users`, { params })
    .then((response) => response.data);
};

export const getNetworkPermissionsApi = async (networkID) => {
  return await createAxiosInstance()
    .get(GET_PERMISSIONS_URI)
    .then((response) => response.data);
};

export const assignPermissionsToRoleApi = async (roleID, data) => {
  return await createAxiosInstance()
    .post(`${GET_ROLES_URI}/${roleID}/permissions`, data)
    .then((response) => response.data);
};

export const removePermissionsFromRoleApi = async (roleID, permissionID) => {
  return await createAxiosInstance()
    .delete(`${GET_ROLES_URI}/${roleID}/permissions/${permissionID}`, {})
    .then((response) => response.data);
};

export const updatePermissionsToRoleApi = async (roleID, data) => {
  return await createAxiosInstance()
    .put(`${GET_ROLES_URI}/${roleID}/permissions`, data)
    .then((response) => response.data);
};

export const getNetworkUsersListApi = async (networkId, params = {}) => {
  return await createAxiosInstance()
    .get(`${GET_NETWORKS_URI}/${networkId}/assigned-users`, { params })
    .then((response) => response.data);
};

export const generateAccessTokenForUserApi = async (userId) => {
  const url = `${GENERATE_ACCESS_TOKEN}`;
  const data = { user_id: userId };
  try {
    const response = await createAxiosInstance().post(url, data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getNetworkListSummaryApi = async () => {
  return await createAxiosInstance()
    .get(`${GET_NETWORKS_URI}/summary`)
    .then((response) => response.data);
};

export const createTeamApi = async (data) => {
  return await createAxiosInstance()
    .post(CREATE_TEAM_URI, data)
    .then((response) => response.data);
};

export const getTeamsApi = async () => {
  return await createAxiosInstance()
    .get(CREATE_TEAM_URI)
    .then((response) => response.data);
};

export const getTeamDetailsApi = async (teamID) => {
  return await createAxiosInstance()
    .get(`${CREATE_TEAM_URI}/${teamID}`)
    .then((response) => response.data);
};

export const updateTeamApi = async (teamID, data) => {
  return await createAxiosInstance()
    .put(`${CREATE_TEAM_URI}/${teamID}`, data)
    .then((response) => response.data);
};

export const createSimApi = async (data) => {
  return await createAxiosInstance()
    .post(GET_SIM_URI, data)
    .then((response) => response.data);
};

export const getSimsApi = async () => {
  return await createAxiosInstance()
    .get(GET_SIM_URI)
    .then((response) => response.data);
};

export const checkSimStatusApi = async (simID) => {
  return await createAxiosInstance()
    .get(`${GET_SIM_URI}/${simID}/status`)
    .then((response) => response.data);
};

// Groups Management APIs
export const getGroupsSummaryApi = async () => {
  return await createAxiosInstance()
    .get(GET_GROUPS_URI)
    .then((response) => response.data);
};

export const getGroupDetailsApi = async (groupId) => {
  return await createAxiosInstance()
    .get(`${GET_GROUPS_URI}/${groupId}`)
    .then((response) => response.data);
};

export const getGroupDevicesApi = async (groupName) => {
  return await createAxiosInstance()
    .get(`${ALL_DEVICES_URI}/summary?group=${groupName}`)
    .then((response) => response.data);
};

export const getGroupSitesApi = async (groupName) => {
  return await createAxiosInstance()
    .get(`${ALL_DEVICES_URI}/sites/summary?group=${groupName}`)
    .then((response) => response.data);
};

export const getGroupUsersApi = async (groupId) => {
  return await createAxiosInstance()
    .get(`${GET_GROUPS_URI}/${groupId}/assigned-users`)
    .then((response) => response.data);
};

export const getGroupCohortsApi = async (groupName) => {
  return await createAxiosInstance()
    .get(`${ALL_DEVICES_URI}/cohorts?group=${groupName}`)
    .then((response) => response.data);
};
