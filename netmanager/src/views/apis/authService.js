import axios from "axios";
import {
  UPDATE_PWD_IN_URI,
  GET_USERS_URI,
  FORGOT_PWD_URI,
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
