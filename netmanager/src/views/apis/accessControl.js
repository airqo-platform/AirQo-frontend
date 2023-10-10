import axios from 'axios';
import {
  GET_NETWORKS_URI,
  GET_PERMISSIONS_URI,
  GET_ROLES_URI,
  GENERATE_ACCESS_TOKEN,
  CREATE_TEAM_URI
} from '../../config/urls/analytics';
import { GET_ACCESS_TOKEN } from '../../config/urls/authService';
import { BASE_AUTH_TOKEN } from '../../utils/envVariables';
import { isEmpty } from 'validate.js';

const jwtToken = localStorage.getItem('jwtToken');
axios.defaults.headers.common.Authorization = jwtToken;

export const createAccessToken = async (data) => {
  return await axios.post(GET_ACCESS_TOKEN, data).then((response) => response.data);
};

export const getRolesApi = async (networkID) => {
  return await axios
    .get(GET_ROLES_URI, { params: { network_id: networkID } })
    .then((response) => response.data);
};

export const getRolesSummaryApi = async (networkID) => {
  return await axios
    .get(`${GET_ROLES_URI}/summary`, { params: { network_id: networkID } })
    .then((response) => response.data);
};

export const getUsersWithRole = async (roleID) => {
  return await axios.get(`${GET_ROLES_URI}/${roleID}/users`).then((response) => response.data);
};

export const addRoleApi = async (data) => {
  return await axios.post(GET_ROLES_URI, data).then((response) => response.data);
};

export const updateRoleApi = async (roleID, data) => {
  return await axios.put(`${GET_ROLES_URI}/${roleID}`, data).then((response) => response.data);
};

export const deleteRoleApi = async (roleID) => {
  return await axios.delete(`${GET_ROLES_URI}/${roleID}`).then((response) => response.data);
};

export const getRoleDetailsApi = async (roleID) => {
  return await axios.get(`${GET_ROLES_URI}/${roleID}`).then((response) => response.data);
};

export const assignUserToRoleApi = async (roleID, data) => {
  return await axios
    .post(`${GET_ROLES_URI}/${roleID}/user`, data)
    .then((response) => response.data);
};

export const createNetworkApi = async (data) => {
  return await axios.post(GET_NETWORKS_URI, data).then((response) => response.data);
};

export const getNetworksApi = async () => {
  return await axios.get(GET_NETWORKS_URI).then((response) => response.data);
};

export const assignUserNetworkApi = async (networkID, userID) => {
  return await axios
    .put(`${GET_NETWORKS_URI}/${networkID}/assign-user/${userID}`)
    .then((response) => response.data);
};

export const getAvailableNetworkUsersListApi = async (networkID) => {
  return await axios
    .get(`${GET_NETWORKS_URI}/${networkID}/available-users`)
    .then((response) => response.data);
};

export const getNetworkPermissionsApi = async (networkID) => {
  return await axios.get(GET_PERMISSIONS_URI).then((response) => response.data);
};

export const assignPermissionsToRoleApi = async (roleID, data) => {
  return await axios
    .post(`${GET_ROLES_URI}/${roleID}/permissions`, data)
    .then((response) => response.data);
};

export const removePermissionsFromRoleApi = async (roleID, permissionID) => {
  return await axios
    .delete(`${GET_ROLES_URI}/${roleID}/permissions/${permissionID}`, {})
    .then((response) => response.data);
};

export const updatePermissionsToRoleApi = async (roleID, data) => {
  return await axios
    .put(`${GET_ROLES_URI}/${roleID}/permissions`, data)
    .then((response) => response.data);
};

export const getNetworkUsersListApi = async (networkID) => {
  return await axios
    .get(`${GET_NETWORKS_URI}/${networkID}/assigned-users`)
    .then((response) => response.data);
};

export const generateAccessTokenForUserApi = async (userId) => {
  const url = `${GENERATE_ACCESS_TOKEN}`;
  const data = { user_id: userId };
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getNetworkListSummaryApi = async () => {
  return await axios.get(`${GET_NETWORKS_URI}/summary`).then((response) => response.data);
};

export const createTeamApi = async (data) => {
  return await axios.post(CREATE_TEAM_URI, data).then((response) => response.data);
};

export const getTeamsApi = async () => {
  return await axios.get(CREATE_TEAM_URI).then((response) => response.data);
};

export const getTeamDetailsApi = async (teamID) => {
  return await axios.get(`${CREATE_TEAM_URI}/${teamID}`).then((response) => response.data);
};

export const updateTeamApi = async (teamID, data) => {
  return await axios.put(`${CREATE_TEAM_URI}/${teamID}`, data).then((response) => response.data);
};
