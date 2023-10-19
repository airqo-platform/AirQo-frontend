import axios from 'axios';

const setAuthToken = (token) => {
  if (token) {
    // Apply authorization token to every request if logged in
    axios.defaults.headers.common['Authorization'] = token;
    axios.interceptors.request.use((config) => {
      const params = config.params || {};

      return { ...config, params: { ...params } };
    });
  } else {
    // Update auth header token to support data access for non-auth users
    axios.defaults.headers.common[
      'Authorization'
    ] = `JWT ${process.env.REACT_APP_AUTHORIZATION_TOKEN}`;
  }
};
export default setAuthToken;
