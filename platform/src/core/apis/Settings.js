import { UPDATE_PWD_URL } from '../urls/authentication';
import { NEXT_PUBLIC_AUTHORISATION } from '../../lib/envConstants';
import axios from 'axios';

axios.defaults.headers.common.Authorization = `JWT ${NEXT_PUBLIC_AUTHORISATION}`;

export const updateUserPasswordApi = async (userId, tenant, userData) => {
  return await axios
    .put(UPDATE_PWD_URL, userData, {
      params: { tenant, id: userId },
    })
    .then((response) => response.data);
};
