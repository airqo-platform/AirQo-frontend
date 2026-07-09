import axios from 'axios';
import { sendToSlack } from '@/lib/logger';

const apiClient = axios.create();

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (!status || status >= 500) {
      sendToSlack("API request failed", error, {
        statusCode: status,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
      });
    }
    return Promise.reject(error);
  },
);

export default apiClient;
