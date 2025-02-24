import axios from 'axios';

// Function to get JWT Token
const getJwtToken = () => {
  return localStorage.getItem('jwtToken');
};

// Access Token
const accessToken = process.env.REACT_APP_AUTH_TOKEN;
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
        config.params = { ...config.params, token: accessToken };
      }
      return config;
    },
    (error) => {
      // Do something with request error
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default createAxiosInstance;
