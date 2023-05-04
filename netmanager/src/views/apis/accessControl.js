import axios from 'axios';
import { GET_NETWORKS_URI, GET_PERMISSIONS_URI, GET_ROLES_URI } from '../../config/urls/analytics';

let token = localStorage.jwtToken;
if (token) {
  axios.defaults.headers.common.Authorization = token;
} else {
  axios.defaults.headers.common.Authorization = `JWT ${process.env.REACT_APP_AUTHORIZATION_TOKEN}`;
}

export const getUserRolesApi = async (networkID) => {
  return await axios
    .get(GET_ROLES_URI, { params: { network_id: networkID } })
    .then((response) => response.data);
};

export const addUserRoleApi = async (data) => {
  return await axios.post(GET_ROLES_URI, data).then((response) => response.data);
};

export const updateUserRoleApi = async (roleID, data) => {
  return await axios.put(`${GET_ROLES_URI}/${roleID}`, data).then((response) => response.data);
};

export const deleteUserRoleApi = async (roleID) => {
  return await axios.delete(`${GET_ROLES_URI}/${roleID}`).then((response) => response.data);
};

export const getNetworksApi = async () => {
  return await axios.get(GET_NETWORKS_URI).then((response) => response.data);
};

export const assignUserNetworkApi = async (networkID, data) => {
  return await axios
    .post(`${GET_NETWORKS_URI}/${networkID}/assign-users`, data)
    .then((response) => response.data);
};

export const getNetworkPermissionsApi = async (networkID) => {
  return await axios
    .get(GET_PERMISSIONS_URI, { params: { network: networkID } })
    .then((response) => response.data);
};

export const assignPermissionsToRoleApi = async (roleID, data) => {
  return await axios
    .post(`${GET_ROLES_URI}/${roleID}/permissions`, data)
    .then((response) => response.data);
};

export const removePermissionsFromRoleApi = async (roleID, permissionID) => {
  return await axios
    .delete(`${GET_ROLES_URI}/${roleID}/permissions/${permissionID}`)
    .then((response) => response.data);
};

export const getNetworkUsersListApi = async (networkID) => {
  return await axios
    .get(`${GET_NETWORKS_URI}/${networkID}/assigned-users`)
    .then((response) => response.data);
};
