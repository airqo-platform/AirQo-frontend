import axios from "axios";
import setAuthToken from "../../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import {
  GET_ERRORS,
  SET_CURRENT_USER,
  USER_LOADING,
  RESET_PWD_SUCCESS,
  DEACTIVATE_USER_REQUEST,
  RECOVERY_EMAIL_REQUEST,
} from "./types";
import constants from "../../config/constants";
// Register User
export const registerUser = (userData, history) => (dispatch) => {
  axios
    .post(constants.REGISTER_USER_URI, userData)
    .then((res) => {
      try {
        history.push("/login");
      } catch (e) {
        console.log(e);
      }
    }) // re-direct to login on successful register
    .catch((err) =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      })
    );
};

// Login - get user token
export const loginUser = (userData) => (dispatch) => {
  axios
    .post(constants.LOGIN_USER_URI, userData)
    .then((res) => {
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
    .catch((err) =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      })
    );
};

// Login - forgot password
export const forgotPassword = (userData) => async (dispatch) => {
  console.dir(userData);
  await axios
    .post(constants.FORGOT_PWD_URI, userData)
    .then((response) => {
      console.log(response.data);
      dispatch({
        type: RECOVERY_EMAIL_REQUEST,
        payload: response.data,
      });
      // if (response.data === "email not recognized") {
      //   this.setState({
      //     showError: true,
      //     messageFromServer: "",
      //   });
      // } else if (response.data === "recovery email sent") {
      //   this.setState({
      //     showError: false,
      //     messageFromServer: "",
      //   });
      // }
    })
    .catch((err) =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response,
      })
    );
};

export const verifyToken = (token) => async (dispatch) => {
  await axios
    .get(constants.VERIFY_TOKEN_URI, token)
    .then((response) => {
      dispatch({
        type: RESET_PWD_SUCCESS,
        payload: response.data,
      });
    })
    .catch((error) => {
      dispatch({
        type: GET_ERRORS,
        payload: error.response,
      });
    });
};

//update password
export const updatePassword = (userData) => {
  axios
    .put(constants.UPDATE_PWD_URI, userData)
    .then((response) => {
      console.log(response.data);
      if (response.data.message === "password updated") {
        this.setState({
          updated: true,
          error: false,
        });
      } else {
        this.setState({
          updated: false,
          error: true,
        });
      }
    })
    .catch((error) => {
      console.log(error.data);
    });
};

//deactivate join request
export const rejectUser = (data) => (dispatch) => {
  axios
    .post(constants.REJECT_USER_URI, data)
    .then((response) => {
      //just console log
      console.log("the reject response" + response);
    })
    .catch((error) => {
      dispatch({
        type: GET_ERRORS,
        payload: error.response,
      });
    });
};

//activate join request
export const acceptUser = (data) => (dispatch) => {
  axios
    .post(constants.ACCEPT_USER_URI, data)
    .then((response) => {
      //just console log
      console.log("the accept user response" + response);
    })
    .catch((error) => {
      dispatch({
        type: GET_ERRORS,
        payload: error.response,
      });
    });
};

//get all users
export const getUsers = (data) => (dispatch) => {
  axios
    .get(constants.GET_USERS_URI, data)
    .then((response) => {
      //just console log
      console.log("the accept user response" + response);
    })
    .catch((error) => {
      dispatch({
        type: GET_ERRORS,
        payload: error.response,
      });
    });
};

// Set logged in user
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded,
  };
};
// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING,
  };
};
// Log user out
export const logoutUser = () => (dispatch) => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};
