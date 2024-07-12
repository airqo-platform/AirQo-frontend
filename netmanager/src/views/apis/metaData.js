import { ADMIN_LEVELS_URL } from '../../reducer/Logs/config/urls/metaData';
import createAxiosInstance from './axiosConfig';

export const adminLevelsApi = async (params) => {
  return await createAxiosInstance()
    .get(ADMIN_LEVELS_URL, { params })
    .then((response) => response.data);
};
