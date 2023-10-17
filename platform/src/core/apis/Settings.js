import { UPDATE_PWD_URL } from '../urls/authentication';
import axios from 'axios';

let jwtToken;
if (typeof window !== 'undefined') {
  jwtToken = window.localStorage.getItem('token');
}
axios.defaults.headers.common.Authorization = jwtToken;

export const updateUserPasswordApi = async (userId, tenant, userData) => {
  return await axios
    .put(UPDATE_PWD_URL, userData, {
      params: { tenant, id: userId },
    })
    .then((response) => response.data);
};
