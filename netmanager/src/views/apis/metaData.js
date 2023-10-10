import axios from 'axios';
import { ADMIN_LEVELS_URL } from '../../config/urls/metaData';
import { isEmpty } from 'validate.js';

const jwtToken = localStorage.getItem('jwtToken');
axios.defaults.headers.common.Authorization = jwtToken;

export const adminLevelsApi = async (params) => {
  return await axios.get(ADMIN_LEVELS_URL, { params }).then((response) => response.data);
};
