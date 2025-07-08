import axios from "axios";

// Function to get JWT Token
const getJwtToken = () => {
  return localStorage.getItem("token");
};

// Access Token
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const createAxiosInstance = (isJWT = true) => {
  const axiosInstance = axios.create();

  // Add a request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      if (isJWT) {
        // Set the JWT authentication header
        config.headers["Authorization"] = getJwtToken();
        config.params = { ...config.params };
      } else {
        // Remove the JWT header and use a query parameter
        delete config.headers["Authorization"];
        config.params = {
          ...config.params,
          token: API_TOKEN?.replace(/[\u200B-\u200D\uFEFF]/g, "").trim(),
        };
      }
      // config.withCredentials = true;
      config.baseURL = API_URL;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add a response interceptor to handle 403 errors globally
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 403) {
        // Dispatch forbidden state to Redux store
        // We'll need to access the store here, so we'll use a custom event
        const forbiddenEvent = new CustomEvent('forbidden-access', {
          detail: {
            message: "You don't have permission to access this resource",
            timestamp: Date.now(),
            url: error.config?.url || 'unknown'
          }
        });
        window.dispatchEvent(forbiddenEvent);
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default createAxiosInstance;
