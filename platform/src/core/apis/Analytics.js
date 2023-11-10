import createAxiosInstance from './axiosConfig';
import { DATA_EXPORT_URL } from '../urls/analytics';

export const exportDataApi = async (body) => {
  const headers = {
    service: 'data-export',
  };

  return await createAxiosInstance()
    .post(DATA_EXPORT_URL, body, { headers })
    .then((response) => response.data);
};
