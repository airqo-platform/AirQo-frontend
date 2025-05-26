import { secureApiProxy, AUTH_TYPES } from '../utils/secureApiProxyClient';
import {
  ACTIVATE_USER_CLIENT,
  ACTIVATION_REQUEST_URI,
  CLIENT_URI,
  GENERATE_TOKEN_URI,
  UPDATE_PWD_URL,
} from '../urls/authentication';

// Password management
export const updateUserPasswordApi = (userId, tenant, userData) =>
  secureApiProxy
    .put(UPDATE_PWD_URL, userData, {
      params: { tenant, id: userId },
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

// Client management
export const getClientsApi = (userID) =>
  secureApiProxy
    .get(CLIENT_URI, {
      params: { user_id: userID },
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const getAllUserClientsApi = () =>
  secureApiProxy
    .get(CLIENT_URI, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const createClientApi = (data) =>
  secureApiProxy
    .post(CLIENT_URI, data, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const updateClientApi = (data, client_id) =>
  secureApiProxy
    .put(`${CLIENT_URI}/${client_id}`, data, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

// Token and activation
export const generateTokenApi = (data) =>
  secureApiProxy
    .post(GENERATE_TOKEN_URI, data, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const activateUserClientApi = (data) =>
  secureApiProxy
    .post(`${ACTIVATE_USER_CLIENT}/${data._id}`, data, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const activationRequestApi = (clientID) =>
  secureApiProxy
    .get(`${ACTIVATION_REQUEST_URI}/${clientID}`, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);
