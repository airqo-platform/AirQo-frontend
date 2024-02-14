import { INQUIRY_URL } from '../urls/inquiry';
import createAxiosInstance from './axiosConfig';

export const registerInquiry = async (body) => {
  return await createAxiosInstance()
    .post(`${INQUIRY_URL}/register`, body)
    .then((response) => response.data);
};
