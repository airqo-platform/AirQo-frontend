import createAxiosInstance from './axiosConfig';
import { DATA_EXPORT_URL, SHARE_REPORT_URL } from '../urls/analytics';

export const exportDataApi = async (body) => {
  const headers = {
    service: 'data-export',
  };

  return await createAxiosInstance()
    .post(DATA_EXPORT_URL, body, { headers })
    .then((response) => response.data);
};

export const shareReportApi = async (body, msg) => {
  const url = `${SHARE_REPORT_URL}?msg=${msg}`;
  return await createAxiosInstance()
    .post(url, body)
    .then((response) => response.data);
};
