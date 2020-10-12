//we will use this to delete the Authorization header for our axios requests
//depending on whether the user is logged in or not

import axios from "axios";
import jwt_decode from "jwt-decode";

const setAuthToken = (token) => {
  if (token) {
    const decoded_token = jwt_decode(token);
    const tenant = decoded_token.organization;

    if (typeof tenant === "undefined") {
      // remove stored tokens to enable user to re-login
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("currentUser");
      throw new Error(
        "This user's organization could not be determined, Please refresh to login again"
      );
    }

    // Apply authorization token to every request if logged in
    axios.defaults.headers.common["Authorization"] = token;
    axios.interceptors.request.use((config) => {
      const params = config.params || {};

      return { ...config, params: { tenant, ...params } };
    });
  } else {
    // Delete auth header
    delete axios.defaults.headers.common["Authorization"];
  }
};
export default setAuthToken;
