import {
  CONFIRM_CANDIDATE_URI,
  UPDATE_PWD_IN_URI,
  GET_USERS_URI,
  FORGOT_PWD_URI,
  DELETE_CANDIDATE_URI,
  REGISTER_USER_URI,
  CHART_DEFAULTS_URI,
  CANDIDATES_URI,
  USER_FEEDBACK_URI,
  GET_LOGS
} from 'config/urls/authService';
import createAxiosInstance from './axiosConfig';

export const updateUserPasswordApi = async (userId, tenant, userData) => {
  return await createAxiosInstance()
    .put(UPDATE_PWD_IN_URI, userData, {
      params: { tenant, id: userId }
    })
    .then((response) => response.data);
};

export const updateAuthenticatedUserApi = async (userId, tenant, userData) => {
  return await createAxiosInstance()
    .put(GET_USERS_URI, userData, { params: { id: userId } })
    .then((response) => response.data);
};

export const forgotPasswordResetApi = async (userData) => {
  const tenant = userData.organisation;
  return await createAxiosInstance()
    .post(FORGOT_PWD_URI, userData, { params: { tenant } })
    .then((response) => response.data);
};

export const confirmCandidateApi = async (candidateData) => {
  return await createAxiosInstance()
    .post(CONFIRM_CANDIDATE_URI, candidateData)
    .then((response) => response.data);
};

export const updateCandidateApi = async (id, newData) => {
  return await createAxiosInstance()
    .put(CANDIDATES_URI, newData, { params: { id } })
    .then((response) => response.data);
};

export const deleteUserApi = async (id) => {
  return await createAxiosInstance()
    .delete(GET_USERS_URI, { params: { id } })
    .then((response) => response.data);
};

export const deleteCandidateApi = async (id) => {
  return await createAxiosInstance()
    .delete(DELETE_CANDIDATE_URI, { params: { id } })
    .then((response) => response.data);
};

export const addUserApi = async (userData) => {
  return await createAxiosInstance()
    .post(REGISTER_USER_URI, userData)
    .then((response) => response.data);
};

export const getUserChartDefaultsApi = async (userID, airqloudID) => {
  return await createAxiosInstance()
    .get(CHART_DEFAULTS_URI, {
      params: { user: userID, airqloud: airqloudID }
    })
    .then((response) => response.data);
};

export const createUserChartDefaultsApi = async (defaultsData) => {
  return await createAxiosInstance()
    .post(CHART_DEFAULTS_URI, defaultsData)
    .then((response) => response.data);
};

export const updateUserChartDefaultsApi = async (chartDefaultID, defaultsData) => {
  return await createAxiosInstance()
    .put(CHART_DEFAULTS_URI, defaultsData, {
      params: { id: chartDefaultID }
    })
    .then((response) => response.data);
};

export const deleteUserChartDefaultsApi = async (chartDefaultID) => {
  return await createAxiosInstance()
    .delete(CHART_DEFAULTS_URI, { params: { id: chartDefaultID } })
    .then((response) => response.data);
};

export const sendUserFeedbackApi = async (feedbackData) => {
  return await createAxiosInstance()
    .post(USER_FEEDBACK_URI, feedbackData)
    .then((response) => response.data);
};

// Logs
export const getLogsApi = async (params) => {
  return await createAxiosInstance()
    .get(GET_LOGS, { params })
    .then((response) => response.data);
};
