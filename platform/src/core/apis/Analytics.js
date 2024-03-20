import createAxiosInstance from './axiosConfig';
import { DATA_EXPORT_URL, SHARE_REPORT_URL } from '../urls/analytics';

export const exportDataApi = async (body) => {
  return await createAxiosInstance()
    .post(DATA_EXPORT_URL, body)
    .then((response) => response.data);
};

export const shareReportApi = async (body) => {
  try {
    return await createAxiosInstance()
      .post(SHARE_REPORT_URL, body)
      .then((response) => response.data);
  } catch (error) {
    console.log(error);
  }
};
