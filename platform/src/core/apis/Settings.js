import { CLIENT_URI, UPDATE_PWD_URL } from '../urls/authentication';
import createAxiosInstance from './axiosConfig';

export const updateUserPasswordApi = async (userId, tenant, userData) => {
  return await createAxiosInstance()
    .put(UPDATE_PWD_URL, userData, {
      params: { tenant, id: userId },
    })
    .then((response) => response.data);
};

export const getClientsApi = async (userID) => {
  return await createAxiosInstance()
    .get(CLIENT_URI, { params: { user_id: userID } })
    .then((response) => response.data);
};
