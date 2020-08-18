import axios from "axios";
import setAuthToken from "../../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import { Route, Redirect } from "react-router-dom";
import { logElement, logText, logObject } from "../../utils/log";
import {
  /*** set system user */
  GET_ERRORS,
  SET_CURRENT_USER_REQUEST,
  SET_CURRENT_USER_SUCCESS,
  SET_CURRENT_USER_FAILED,
  USER_LOADING,
  /** reset pwd */
  RESET_PWD_REQUEST,
  RESET_PWD_SUCCESS,
  RESET_PWD_FAILED,
  /**load users */
  LOAD_USERS_REQUEST,
  LOAD_USERS_SUCCESS,
  LOAD_USERS_FAILED,
  /**update user */
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILED,
  /**delete user */
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILED,
  /***forgot pwd */
  FORGOT_PWD_REQUEST,
  FORGOT_PWD_SUCCESS,
  FORGOT_PWD_FAILED,
  /*** add user */
  ADD_USER_REQUEST,
  ADD_USER_SUCCESS,
  ADD_USER_FAILED,
  /*** add candidate */
  ADD_CANDIDATE_REQUEST,
  ADD_CANDIDATE_SUCCESS,
  ADD_CANDIDATE_FAILED,
  /*** confirm email */
  CONFIRM_EMAIL_REQUEST,
  CONFIRM_EMAIL_SUCCESS,
  CONFIRM_EMAIL_FAILED,
  /*** update password */
  UPDATE_PWD_REQUEST,
  UPDATE_PWD_SUCCESS,
  UPDATE_PWD_FAILED,
  /**load defaults */
  LOAD_DEFAULTS_REQUEST,
  LOAD_DEFAULTS_SUCCESS,
  LOAD_DEFAULTS_FAILED,
  /** set defaults */
  SET_DEFAULTS_REQUEST,
  SET_DEFAULTS_SUCCESS,
  SET_DEFAULTS_FAILED,
} from "./types";
import constants from "../../config/constants";

/** =================================================================== */
/** add a new user */
export const registerUser = (userData, history) => (dispatch) => {
  dispatch({
    type: ADD_USER_REQUEST,
    payload: "",
  });
  axios
    .post(constants.REGISTER_USER_URI, userData)
    .then((res) => {
      dispatch({
        type: ADD_USER_SUCCESS,
        payload: "",
      });
    }) // re-direct to login on successful register
    .catch((err) =>
      dispatch({
        type: ADD_USER_FAILED,
        payload: err.response.data,
      })
    );
};

/** =================================================================== */
/** add a new candidate */
export const registerCandidate = (userData, history) => (dispatch) => {
  dispatch({
    type: ADD_CANDIDATE_REQUEST,
    payload: "",
  });
  axios
    .post(constants.REGISTER_CANDIDATE_URI, userData)
    .then((res) => {
      dispatch({
        type: ADD_CANDIDATE_SUCCESS,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch({
        type: ADD_CANDIDATE_FAILED,
        payload: err.response.data,
      })
    );
};

/** =================================================================== */
/** update a user */
export const updateUser = (userData) => (dispatch) => {
  dispatch({
    type: UPDATE_USER_REQUEST,
    payload: "",
  });
  axios
    .post(constants.UPDATE_USER_URI, userData)
    .then((response) => {
      console.log(response.data);
      dispatch({
        type: UPDATE_USER_SUCCESS,
        payload: response.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: UPDATE_USER_FAILED,
        payload: "",
      });
    });
};

/** =================================================================== */
/*** delete a user */
export const deleteUser = (userID) => (dispatch) => {
  dispatch({
    type: DELETE_USER_REQUEST,
    payload: "",
  });
  axios
    .delete(constants.DELETE_USER_URI, {
      params: {
        user: userID,
      },
    })
    .then((response) => {
      logElement("the reponse from axios", response.data);
      dispatch({
        type: DELETE_USER_SUCCESS,
        payload: response.data,
      });
    })
    .catch((res) => {
      dispatch({
        type: DELETE_USER_FAILED,
        payload: "",
      });
    });
};

/** =================================================================== */
/*** set up a new user */
export const loginUser = (userData) => (dispatch) => {
  dispatch({
    type: SET_CURRENT_USER_REQUEST,
    payload: "",
  });
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

// log user out
export const logoutUser = () => (dispatch) => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};

// set logged in user
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER_SUCCESS,
    payload: decoded,
  };
};

// user loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING,
  };
};

/** =================================================================== */
/** forgot password */
export const forgotPassword = (userData) => async (dispatch) => {
  dispatch({
    type: FORGOT_PWD_REQUEST,
    payload: "",
  });
  console.dir(userData);
  await axios
    .post(constants.FORGOT_PWD_URI, userData)
    .then((response) => {
      console.log(response.data);
      dispatch({
        type: FORGOT_PWD_SUCCESS,
        payload: response.data,
      });
    })
    .catch((err) =>
      dispatch({
        type: FORGOT_PWD_FAILED,
        payload: err.response.data,
      })
    );
};

/** =================================================================== */
/** reset password */
export const resetPassword = (token) => (dispatch) => {
  dispatch({
    type: RESET_PWD_REQUEST,
    payload: "",
  });
  axios
    .post(constants.RESET_PWD_URI, token)
    .then((response) => {
      logElement("reset pwd api response", response.data);
      dispatch({
        type: RESET_PWD_SUCCESS,
        payload: response.data,
      });
    })
    .catch((error) => {
      logElement("reset pwd api error", error);
      dispatch({
        type: RESET_PWD_FAILED,
        payload: "",
      });
    });
};

/** =================================================================== */
/** update password */
export const updatePassword = (userData) => {
  dispatch({
    type: UPDATE_PWD_REQUEST,
  });
  axios
    .put(constants.UPDATE_PWD_URI, userData)
    .then((response) => {
      console.log(response.data);
      dispatch({
        type: UPDATE_PWD_SUCCESS,
        payload: response.data,
      });
    })
    .catch((error) => {
      dispatch({
        type: UPDATE_PWD_FAILED,
        payload: error,
      });
    });
};

/** =================================================================== */
/*** load users */
export const fetchUsers = (data) => (dispatch) => {
  dispatch({
    type: LOAD_USERS_REQUEST,
    payload: "",
  });
  axios
    .get(constants.GET_USERS_URI, data)
    .then((response) => {
      logElement("load users api response", response.data);
      dispatch({
        type: LOAD_USERS_SUCCESS,
        payload: response.data,
      });
    })
    .catch((error) => {
      dispatch({
        type: LOAD_USERS_FAILED,
        payload: error.response,
      });
    });
};

/** =================================================================== */

export const fetchDefaults = (data) => (dispatch) => {
  dispatch({
    type: LOAD_DEFAULTS_REQUEST,
    payload: "",
  });
  axios
    .get(constants.GET_DEFAULTS_URI, data)
    .then((response) => {
      logElement("load users api response", response.data);
      dispatch({
        type: LOAD_DEFAULTS_SUCCESS,
        payload: response.data,
      });
    })
    .catch((error) => {
      dispatch({
        type: LOAD_DEFAULTS_FAILED,
        payload: error.response,
      });
    });
};

export const setDefaults = (data) => (dispatch) => {
  dispatch({
    type: SET_DEFAULTS_REQUEST,
    payload: "",
  });
  axios
    .post(constants.SET_DEFAULTS_URI, data)
    .then((response) => {
      logElement("set defaults response", response.data);
      dispatch({
        type: SET_DEFAULTS_SUCCESS,
        payload: "",
      });
    })
    .catch((error) => {
      logElement("setting defaults error", error);
      dispatch({
        type: SET_DEFAULTS_FAILED,
        payload: "",
      });
    });
};
