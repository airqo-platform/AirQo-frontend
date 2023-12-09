import axios from 'axios';
import { NEXT_PUBLIC_API_BASE_URL } from '../../lib/envConstants';

// Function to get JWT Token
const getJwtToken = () => {
  return localStorage.getItem('token');
};

// Access Token
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
let tenant = 'airqo';

const createAxiosInstance = (isJWT = true) => {
  const axiosInstance = axios.create();

  // Add a request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      if (isJWT) {
        // Set the JWT authentication header
        config.headers['Authorization'] = getJwtToken();
        config.params = { tenant, ...config.params };
      } else {
        // Remove the JWT header and use a query parameter
        delete config.headers['Authorization'];
        config.params = { ...config.params, token: API_TOKEN };
      }
      config.withCredentials = true;
      config.baseURL = NEXT_PUBLIC_API_BASE_URL;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  return axiosInstance;
};

export default createAxiosInstance;
