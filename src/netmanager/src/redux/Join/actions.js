/* eslint-disable */
import createAxiosInstance from '../../views/apis/axiosConfig';
import setAuthToken from '../../utils/setAuthToken';
import jwt_decode from 'jwt-decode';
import {
  CLEAR_ERRORS,
  GET_ERRORS,
  SET_CURRENT_USER,
  USER_LOADING,
  GET_USERS_REQUEST,
  GET_USERS_SUCCESS,
  GET_USERS_FAILED,
  GET_DEFAULTS_REQUEST,
  GET_DEFAULTS_SUCCESS,
  GET_DEFAULTS_FAILED,
  REGISTER_USER_REQUEST,
  REGISTER_USER_SUCCESS,
  SHOW_CONFIRM_DIALOG,
  REGISTER_USER_FAILED,
  SHOW_EDIT_DIALOG,
  HIDE_EDIT_DIALOG,
  EDIT_USER_REQUEST,
  EDIT_USER_SUCCESS,
  EDIT_USER_FAILED,
  SHOW_DELETE_DIALOG,
  HIDE_DELETE_DIALOG,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILED,
  UPDATE_PASSWORD_SUCCESS,
  HIDE_CONFIRM_DIALOG,
  CONFIRM_USER_REQUEST,
  CONFIRM_USER_SUCCESS,
  CONFIRM_USER_FAILED,
  SET_DEFAULTS_REQUEST,
  SET_DEFAULTS_SUCCESS,
  SET_DEFAULTS_FAILED,
  REGISTRATION_SUCCESS,
  SHOW_REGISTER_DIALOG,
  HIDE_REGISTER_DIALOG,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAILED,
  UPDATE_AUTHENTICATED_USER_REQUEST,
  UPDATE_AUTHENTICATED_USER_FAILED,
  UPDATE_AUTHENTICATED_USER_SUCCESS,
  UPDATE_ORGANIZATION_SUCCESS,
  RESET_ERRORS_SUCCESS,
  RESET_USER_STATE_SUCCESS,
  RESET_ORGANIZATION_SUCCESS,
  LOGOUT_USER_SUCCESS,
  LOGOUT_USER_FAILURE
} from './types';
import { resetMapState } from '../Maps/actions';
import { resetDashboardState } from '../Dashboard/operations';
import { resetDeviceRegistryState } from '../DeviceRegistry/operations';
import { resetAlertState, updateMainAlert } from '../MainAlert/operations';
import {
  GET_USERS_URI,
  REGISTER_USER_URI,
  LOGIN_USER_URI,
  FORGOT_PWD_URI,
  VERIFY_TOKEN_URI,
  UPDATE_PWD_IN_URI,
  DEFAULTS_URI
} from 'config/urls/authService';
import { setDefaultAirQloud } from '../AirQloud/operations';
import { fetchNetworkUsers } from '../AccessControl/operations';

/***************************errors ********************************* */

export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};

/***************************organization actions ********************************* */
export const setOrganization = () => (dispatch, getState) => {
  const name = getState().auth.user.organization;
  if (name) {
    dispatch(updateOrganization({ name }));
  } else {
    dispatch(updateOrganization('airqo'));
  }
};

export const updateOrganization = (orgData) => (dispatch) => {
  dispatch({
    type: UPDATE_ORGANIZATION_SUCCESS,
    payload: orgData
  });
};

/********************* Add a new user ***********************************/
export const addNewUser = (user) => {
  return (dispatch) => {
    dispatch(addNewUserRequest(user));
    createAxiosInstance()
      .post(REGISTER_USER_URI, user)
      .then((res) => {
        const { savedData, message } = res.data;
        try {
          dispatch(addNewUserRequestSuccess(savedData, message));
        } catch (e) {
          console.log(e);
        }
      })
      .catch((error) => {
        dispatch(addNewUserRequestFailed(error));
      });
  };
};

export const addNewUserRequest = (user) => {
  return {
    type: REGISTER_USER_REQUEST,
    user
  };
};

export const addNewUserRequestSuccess = (user, message) => {
  return {
    type: REGISTER_USER_SUCCESS,
    user: user,
    message: message
  };
};

export const addNewUserRequestFailed = (error) => {
  return {
    type: REGISTER_USER_FAILED,
    error
  };
};

export const showAddDialog = () => {
  return {
    type: SHOW_REGISTER_DIALOG
  };
};

export const hideAddDialog = () => {
  return {
    type: HIDE_REGISTER_DIALOG
  };
};

/********************* Edit a user ***********************************/

export const showEditDialog = (userToEdit) => {
  return {
    type: SHOW_EDIT_DIALOG,
    user: userToEdit
  };
};

export const hideEditDialog = () => {
  return {
    type: HIDE_EDIT_DIALOG
  };
};

export const editUser = (userToEdit) => (dispatch) => {
  dispatch(editUserRequest(userToEdit));

  const id = userToEdit.id;
  return createAxiosInstance()
    .put(GET_USERS_URI, userToEdit, { params: { id } })
    .then((response) => {
      if (response) {
        dispatch(
          updateMainAlert({
            message: response.data.message,
            show: true,
            severity: 'success'
          })
        );
        dispatch(editUserSuccess(response.data, response.data.message));
        const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});
        if (!isEmpty(activeNetwork)) {
          dispatch(fetchNetworkUsers(activeNetwork._id));
        }
      } else {
        dispatch(editUserFailed(response.data.message));
        dispatch(
          updateMainAlert({
            message: response.data.message,
            show: true,
            severity: 'error'
          })
        );
      }
    })
    .catch((e) => {
      dispatch(editUserFailed(e));
    });
};

export const editUserRequest = (userToEdit) => {
  return {
    type: EDIT_USER_REQUEST,
    userToEdit: userToEdit
  };
};

export const editUserSuccess = (userToEdit, message) => {
  return {
    type: EDIT_USER_SUCCESS,
    userToEdit: userToEdit,
    message: message
  };
};

export const editUserFailed = (error) => {
  return {
    type: EDIT_USER_FAILED,
    error
  };
};

/********************* Delete a user ***********************************/

export const deleteUserDialog = (userToDelete) => {
  return {
    type: SHOW_DELETE_DIALOG,
    user: userToDelete
  };
};

export const hideDeleteDialog = () => {
  return {
    type: HIDE_DELETE_DIALOG
  };
};

export const deleteUser = (userToDelete) => {
  return (dispatch) => {
    const id = userToDelete._id;

    dispatch(deleteUserRequest(userToDelete));
    return createAxiosInstance()
      .delete(GET_USERS_URI, { params: { id } })
      .then((response) => response.data)
      .then((data) => {
        dispatch(deleteUserSuccess(data.user, data.message));
        dispatch(
          updateMainAlert({
            show: true,
            message: data.message,
            severity: 'success'
          })
        );
      })
      .catch((err) => {
        dispatch(deleteUserFailed(err.response.data));
        dispatch(
          updateMainAlert({
            show: true,
            message:
              (err.response && err.response.data && err.response.data.message) ||
              'Could not delete user',
            severity: 'error'
          })
        );
      });
  };
};

export const deleteUserRequest = (userToDelete) => {
  return {
    type: DELETE_USER_REQUEST,
    userToDelete
  };
};

export const deleteUserSuccess = (userToDelete, message) => {
  return {
    type: DELETE_USER_SUCCESS,
    userToDelete: userToDelete,
    message: message
  };
};

export const deleteUserFailed = (error) => {
  return {
    type: DELETE_USER_FAILED,
    error
  };
};

/************************* Register a new User  *****************************/
export const registerCandidate = (tenant, userData, callback) => (dispatch) => {
  return (
    createAxiosInstance()
      .post(REGISTER_CANDIDATE_URI, userData, { params: { tenant } })
      .then((res) => {
        if (res.data.success) {
          dispatch(registrationSuccess(res.data));
          dispatch(
            updateMainAlert({
              show: true,
              message: 'Your access request has been submitted successfully.',
              severity: 'success'
            })
          );
          callback && callback();
        } else {
          dispatch(
            updateMainAlert({
              show: true,
              message: res.data.message,
              severity: 'error'
            })
          );
          dispatch({
            type: GET_ERRORS,
            payload: (res.data && res.data.message) || null
          });
        }
      })
      // re-direct to login on successful register
      .catch((err) => {
        if (err.response) {
          dispatch({
            type: GET_ERRORS,
            payload: err.response || null
          });
        } else if (err.request) {
          dispatch({
            type: GET_ERRORS,
            payload: { data: { message: 'Please check your internet connectivity' } }
          });
        } else throw err();
      })
  );
};

export const registrationSuccess = (data) => {
  return {
    type: REGISTRATION_SUCCESS,
    payload: data.savedData
  };
};

/************************* Login a new User  *********************************/
export const loginUser = (userData) => (dispatch) => {
  const tenant = userData.organization;
  createAxiosInstance()
    .post(LOGIN_USER_URI, userData, { params: { tenant } })
    .then((res) => {
      try {
        // Save to localStorage
        // Set token to localStorage
        const { token } = res.data;
        localStorage.setItem('jwtToken', token);
        // Set token to Auth header
        setAuthToken(token);
        // Decode token to get user data
        const decoded = jwt_decode(token);
        localStorage.setItem('currentUser', JSON.stringify(decoded));
        // Set current user
        dispatch(setCurrentUser(decoded));
        dispatch(updateOrganization({ name: decoded.organization }));
        dispatch(setDefaultAirQloud());
      } catch (e) {
        console.log(e);
      }
    })
    .catch((err) => {
      if (err.response) {
        dispatch(
          updateMainAlert({
            show: true,
            message: err.response.data.message,
            severity: 'error'
          })
        );
      } else if (err.request) {
        dispatch({
          type: GET_ERRORS,
          payload: { data: { message: 'Please check your internet connectivity' } }
        });
      } else throw err();
    });
};

// Login - forgot password
export const forgotPassword = (userData) => (dispatch) => {
  createAxiosInstance()
    .post(FORGOT_PWD_URI, userData)
    .then((response) => {
      if (response.data === 'email not recognized') {
        this.setState({
          showError: true,
          messageFromServer: ''
        });
      } else if (response.data === 'recovery email sent') {
        this.setState({
          showError: false,
          messageFromServer: ''
        });
      }
    })
    .catch((err) =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response || null
      })
    );
};

//Reset Password - verify Token

export const verifyToken = async (token) => {
  await createAxiosInstance()
    .get(VERIFY_TOKEN_URI, token)
    .then((response) => {
      if (response.data.message === 'password reset link a-ok') {
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
    .catch((error) => {
      console.log(error.data);
    });
};

// Get user details
export const getUserDetails = async (userId) => {
  const response = await createAxiosInstance().get(`${GET_USERS_URI}/${userId}`);
  return response.data;
};

// Set logged in user
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

export const resetErrorsState = () => {
  return { type: RESET_ERRORS_SUCCESS };
};

export const resetUsersState = () => {
  return { type: RESET_USER_STATE_SUCCESS };
};

export const resetOrgState = () => {
  return { type: RESET_ORGANIZATION_SUCCESS };
};
// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING
  };
};
// Log user out

export const clearState = () => (dispatch) => {
  dispatch(setCurrentUser({}));
  dispatch(resetErrorsState());
  dispatch(resetUsersState());
  dispatch(resetMapState());
  dispatch(resetDashboardState());
  dispatch(resetDeviceRegistryState());
  dispatch(resetOrgState());
  dispatch(resetAlertState());
};

export const logoutUser = () => (dispatch) => {
  // Remove token from local storage
  localStorage.removeItem('jwtToken');
  // Remove token from local storage
  localStorage.removeItem('currentUser');
  // Remove token from local storage
  localStorage.removeItem('activeNetwork');
  // Remove token from local storage
  localStorage.removeItem('userNetworks');
  // Remove token from local storage
  localStorage.removeItem('currentUserRole');
  // Remove auth header for future requests
  setAuthToken(false);
  // clear redux state on logout
  dispatch(clearState());
  dispatch({ type: LOGOUT_USER_SUCCESS });
};

/*********************************** confirming users************************************/
export const confirmUserDialog = (userToConfirm, message) => {
  return {
    type: SHOW_CONFIRM_DIALOG,
    user: userToConfirm
  };
};

export const hideConfirmDialog = () => {
  return {
    type: HIDE_CONFIRM_DIALOG
  };
};

export const confirmUser = (userToConfirm) => (dispatch) => {
  dispatch(confirmUserRequest(userToConfirm));
  return createAxiosInstance()
    .post(GET_USERS_URI, userToConfirm)
    .then((response) => {
      if (response) {
        dispatch(confirmUserSuccess(response.data.user, response.data.message));
      } else {
        dispatch(confirmUserFailed(response.data.message));
      }
    })
    .catch((e) => {
      dispatch(confirmUserFailed(e));
    });
};

export const confirmUserRequest = (userToConfirm) => {
  return {
    type: CONFIRM_USER_REQUEST,
    user: userToConfirm
  };
};

export const confirmUserSuccess = (userToConfirm, message) => {
  return {
    type: CONFIRM_USER_SUCCESS,
    userToConfirm: userToConfirm,
    message: message
  };
};

export const confirmUserFailed = (error) => {
  return {
    type: CONFIRM_USER_FAILED,
    error
  };
};

/**********************update the user password  ***********************************/
export const updatePassword = (userData) => (dispatch, getState) => {
  const id = getState().auth.user._id;
  createAxiosInstance()
    .put(UPDATE_PWD_IN_URI, userData, { params: { id } })
    .then((response) => response.data)
    .then((data) => dispatch({ type: UPDATE_PASSWORD_SUCCESS, payload: data.result }))
    .catch((error) => dispatch({ type: GET_ERRORS, payload: error.response || null }));
};

/***************************update the user profile ******************** */

export const updateProfile = (userData) => (dispatch) => {
  dispatch({ type: UPDATE_PROFILE_REQUEST });
  return createAxiosInstance()
    .put(GET_USERS_URI, userData)
    .then((response) => {
      if (response) {
        dispatch({
          type: UPDATE_PROFILE_SUCCESS
        });
      } else {
        dispatch({
          type: UPDATE_PROFILE_FAILED
        });
      }
    })
    .catch((e) => {
      dispatch({});
    });
};

//*********************************** default settings ************************************/
export const setDefaults = (values, id) => (dispatch) => {
  dispatch(setDefaultsRequest(values));
  return createAxiosInstance()
    .put(DEFAULTS_URI + '/' + `${values.id}`, values)
    .then((response) => {
      if (response) {
        dispatch(setDefaultsSuccess(response.data.saved, response.data.message));
      } else {
        dispatch(setDefaultsFailed(response.data.message));
      }
    })
    .catch((e) => {
      dispatch(confirmUserFailed(e));
    });
};

export const setDefaultsRequest = (values) => {
  return {
    type: SET_DEFAULTS_REQUEST
  };
};

export const setDefaultsSuccess = (data, mes) => {
  return {
    type: SET_DEFAULTS_SUCCESS,
    message: mes,
    defaults: data
  };
};

export const setDefaultsFailed = (error) => {
  return {
    type: SET_DEFAULTS_FAILED,
    error
  };
};

//********************** fetching default settings ***************************/
export const fetchDefaults = (userId) => {
  return (dispatch) => {
    dispatch(fetchDefaultsRequest());
    return createAxiosInstance()
      .get(`${DEFAULTS_URI}/${userId}`)
      .then((response) => response.data)
      .then((responseData) => {
        dispatch(fetchDefaultsSuccess(data.defaults, data.message));
      })
      .catch((err) => dispatch(fetchDefaultsFailed(err.response.data)));
  };
};

export const fetchDefaultsRequest = () => {
  return {
    type: GET_DEFAULTS_REQUEST
  };
};

export const fetchDefaultsSuccess = (defaults, message) => {
  return {
    type: GET_DEFAULTS_SUCCESS,
    defaults: defaults,
    message: message
  };
};

export const fetchDefaultsFailed = (error) => {
  return {
    type: GET_DEFAULTS_FAILED,
    error
  };
};

/********************* update authenticated user ************************/
export const updateAuthenticatedUser = (newData) => (dispatch, getState) => {
  dispatch(updateAuthenticatedUserRequest());
  const id = getState().auth.user._id;
  return createAxiosInstance()
    .put(GET_USERS_URI, newData, { params: { id } })
    .then((response) => {
      if (response) {
        dispatch(updateAuthenticatedUserSuccess(response.data, response.data.message));
      } else {
        dispatch(updateAuthenticatedUserFailed(response.data.message));
      }
    })
    .catch((e) => {
      dispatch(updateAuthenticatedUserFailed(e));
    });
};

export const updateAuthenticatedUserRequest = () => {
  return {
    type: UPDATE_AUTHENTICATED_USER_REQUEST
  };
};

export const updateAuthenticatedUserSuccess = (updatedUser, message) => {
  return {
    type: UPDATE_AUTHENTICATED_USER_SUCCESS,
    payload: updatedUser,
    message: message
  };
};

export const updateAuthenticatedUserFailed = (error) => {
  return {
    type: UPDATE_AUTHENTICATED_USER_FAILED,
    error
  };
};
