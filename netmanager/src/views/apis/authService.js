import axios from "axios";
import {
  CONFIRM_CANDIDATE_URI,
  UPDATE_PWD_IN_URI,
  GET_USERS_URI,
  FORGOT_PWD_URI,
  DELETE_CANDIDATE_URI,
  REGISTER_USER_URI,
  CHART_DEFAULTS_URI,
} from "config/urls/authService";

export const updateUserPasswordApi = async (userId, tenant, userData) => {
  return await axios
    .put(UPDATE_PWD_IN_URI, userData, {
      params: { tenant, id: userId },
    })
    .then((response) => response.data);
};

export const updateAuthenticatedUserApi = async (userId, tenant, userData) => {
  return await axios
    .put(GET_USERS_URI, userData, { params: { id: userId } })
    .then((response) => response.data);
};

export const forgotPasswordResetApi = async (userData) => {
  const tenant = userData.organisation;
  return await axios
    .post(FORGOT_PWD_URI, userData, { params: { tenant } })
    .then((response) => response.data);
};

export const confirmCandidateApi = async (candidateData) => {
  return await axios
    .post(CONFIRM_CANDIDATE_URI, candidateData)
    .then((response) => response.data);
};

export const deleteCandidateApi = async (id) => {
  return await axios
    .delete(DELETE_CANDIDATE_URI, { params: { id } })
    .then((response) => response.data);
};

export const addUserApi = async (userData) => {
  return await axios
    .post(REGISTER_USER_URI, userData)
    .then((response) => response.data);
};

export const getUserChartDefaultsApi = async (userID, airqloudID) => {
  return await axios
    .get(CHART_DEFAULTS_URI, {
      // params: { id: userID },
      params: { id: userID, airqloud_id: airqloudID },
    })
    .then((response) => response.data);
};

export const createUserChartDefaultsApi = async (defaultsData) => {
  console.log("running User default create")
  console.log('data', defaultsData)
  return await axios
    .post(CHART_DEFAULTS_URI, defaultsData)
    .then((response) => response.data)
    .catch((err) => console.log('err', err.response));
};

export const updateUserChartDefaultsApi = async (
  userID,
  airqloudID,
  { defaultsData }
) => {
  return await axios
    .put(CHART_DEFAULTS_URI, defaultsData, {
      params: { id: userID, airqloud_id: airqloudID },
    })
    .then((response) => response.data);
};

export const deleteUserChartDefaultsApi = async (chartDefaultID) => {
  return await axios
    .delete(CHART_DEFAULTS_URI, { params: { id: chartDefaultID } })
    .then((response) => response.data);
};
