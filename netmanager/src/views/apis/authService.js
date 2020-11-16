import axios from "axios";
import constants from "../../config/constants";

export const updateUserPasswordApi = async (userId, tenant, userData) => {
  return await axios
    .put(constants.UPDATE_PWD_IN_URI, userData, {
      params: { tenant, id: userId },
    })
    .then((response) => response.data);
};

export const updateAuthenticatedUserApi = async (userId, tenant, userData) => {
  return await axios
    .put(constants.GET_USERS_URI, userData, { params: { id: userId } })
    .then((response) => response.data);
};

export const forgotPasswordResetApi = async (userData) => {
  const tenant = userData.organisation;
  return await axios
    .post(constants.FORGOT_PWD_URI, userData, { params: { tenant } })
    .then((response) => response.data);
};
