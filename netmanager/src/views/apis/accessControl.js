import axios from 'axios';
import { GET_ROLES_URI } from '../../config/urls/analytics';

axios.defaults.headers.common.Authorization = `JWT ${process.env.REACT_APP_AUTHORIZATION_TOKEN}`;

export const getUserRolesApi = async () => {
  return await axios.get(GET_ROLES_URI).then((response) => response.data);
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
