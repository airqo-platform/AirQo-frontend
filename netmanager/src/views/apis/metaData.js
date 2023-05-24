import axios from 'axios';
import { ADMIN_LEVELS_URL } from '../../config/urls/metaData';

export const adminLevelsApi = async (params) => {
  return await axios.get(ADMIN_LEVELS_URL, { params }).then((response) => response.data);
};
