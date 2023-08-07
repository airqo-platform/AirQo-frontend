import axios from 'axios';
import { GET_NETWORKS_URI, GET_PERMISSIONS_URI, GET_ROLES_URI } from '../../config/urls/analytics';
import { GET_ACCESS_TOKEN } from '../../config/urls/authService';
import { BASE_AUTH_TOKEN } from '../../utils/envVariables';

axios.defaults.headers.common.Authorization = `JWT ${process.env.REACT_APP_AUTHORIZATION_TOKEN}`;

export const createAccessToken = async (data) => {
  return await axios.post(GET_ACCESS_TOKEN, data).then((response) => response.data);
};

export const getRolesApi = async (networkID) => {
  return await axios
    .get(GET_ROLES_URI, { params: { network_id: networkID, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getRolesSummaryApi = async (networkID) => {
  return await axios
    .get(`${GET_ROLES_URI}/summary`, { params: { network_id: networkID, token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getUsersWithRole = async (roleID) => {
  return await axios
    .get(`${GET_ROLES_URI}/${roleID}/users`, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const addRoleApi = async (data) => {
  return await axios
    .post(GET_ROLES_URI, data, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const updateRoleApi = async (roleID, data) => {
  return await axios
    .put(`${GET_ROLES_URI}/${roleID}`, data, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const deleteRoleApi = async (roleID) => {
  return await axios
    .delete(`${GET_ROLES_URI}/${roleID}`, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getRoleDetailsApi = async (roleID) => {
  return await axios
    .get(`${GET_ROLES_URI}/${roleID}`, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const assignUserToRoleApi = async (roleID, data) => {
  return await axios
    .post(`${GET_ROLES_URI}/${roleID}/user`, data, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const createNetworkApi = async (data) => {
  return await axios
    .post(GET_NETWORKS_URI, data, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getNetworksApi = async () => {
  return await axios
    .get(GET_NETWORKS_URI, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const assignUserNetworkApi = async (networkID, userID) => {
  return await axios
    .put(`${GET_NETWORKS_URI}/${networkID}/assign-user/${userID}`, {
      params: { token: BASE_AUTH_TOKEN }
    })
    .then((response) => response.data);
};

export const getAvailableNetworkUsersListApi = async (networkID) => {
  return await axios
    .get(`${GET_NETWORKS_URI}/${networkID}/available-users`, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getNetworkPermissionsApi = async (networkID) => {
  return await axios
    .get(GET_PERMISSIONS_URI, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const assignPermissionsToRoleApi = async (roleID, data) => {
  return await axios
    .post(`${GET_ROLES_URI}/${roleID}/permissions`, data, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const removePermissionsFromRoleApi = async (roleID, permissionID) => {
  return await axios
    .delete(`${GET_ROLES_URI}/${roleID}/permissions/${permissionID}`, {
      params: { token: BASE_AUTH_TOKEN }
    })
    .then((response) => response.data);
};

export const updatePermissionsToRoleApi = async (roleID, data) => {
  return await axios
    .put(`${GET_ROLES_URI}/${roleID}/permissions`, data, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};

export const getNetworkUsersListApi = async (networkID) => {
  return await axios
    .get(`${GET_NETWORKS_URI}/${networkID}/assigned-users`, { params: { token: BASE_AUTH_TOKEN } })
    .then((response) => response.data);
};
