import axios from "axios";
import setAuthToken from "../../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import { GET_ERRORS, SET_CURRENT_USER, USER_LOADING } from "./types";
// Register User
export const registerUser = (userData, history) => dispatch => {
  axios
    .post("http://localhost:3000/api/v1/users/register", userData)
    .then(res => history.push("/login")) // re-direct to login on successful register
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};
// Login - get user token
export const loginUser = userData => dispatch => {
  axios
    .post("http://localhost:3000/api/v1/users/loginUser", userData)
    .then(res => {
      // Save to localStorage
      // Set token to localStorage
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response
      })
    );
};

// Login - forgot password
export const forgotPassword = userData => dispatch => {
  axios
    .post("http://localhost:3000/forgotPassword", userData)
    .then(response => {
      console.log(response.data);
      if (response.data === "email not recognized") {
        this.setState({
          showError: true,
          messageFromServer: ""
        });
      } else if (response.data === "recovery email sent") {
        this.setState({
          showError: false,
          messageFromServer: ""
        });
      }
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response
      })
    );
};

//Reset Password - verify Token

export const verifyToken = async token => {
  await axios
    .get("http://localhost:3000/reset", token)
    .then(response => {
      console.log(response);
      if (response.data.message === "password reset link a-ok") {
        this.setState({
          username: response.data.username,
          update: false,
          isLoading: false,
          error: false
        });
      } else {
        this.setState({
          update: false,
          isLoading: false,
          error: true
        });
      }
    })
    .catch(error => {
      console.log(error.data);
    });
};

export const updatePassword = userData => {
  axios
    .put("http://localhost:3000/updatePasswordViaEmail", userData)
    .then(response => {
      console.log(response.data);
      if (response.data.message === "password updated") {
        this.setState({
          updated: true,
          error: false
        });
      } else {
        this.setState({
          updated: false,
          error: true
        });
      }
    })
    .catch(error => {
      console.log(error.data);
    });
};

// Set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};
// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING
  };
};
// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};
