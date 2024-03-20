import { UPDATE_PWD_URL } from '../urls/authentication';
import createAxiosInstance from './axiosConfig';

export const updateUserPasswordApi = async (userId, tenant, userData) => {
  return await createAxiosInstance()
    .put(UPDATE_PWD_URL, userData, {
      params: { tenant, id: userId },
    })
    .then((response) => response.data);
};
