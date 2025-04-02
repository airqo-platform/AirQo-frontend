import { api } from '../utils/apiClient';
import {
  ACTIVATE_USER_CLIENT,
  ACTIVATION_REQUEST_URI,
  CLIENT_URI,
  GENERATE_TOKEN_URI,
  UPDATE_PWD_URL,
} from '../urls/authentication';

// Password management
export const updateUserPasswordApi = (userId, tenant, userData) =>
  api
    .put(UPDATE_PWD_URL, userData, { params: { tenant, id: userId } })
    .then((response) => response.data);

// Client management
export const getClientsApi = (userID) =>
  api
    .get(CLIENT_URI, { params: { user_id: userID } })
    .then((response) => response.data);

export const getAllUserClientsApi = () =>
  api.get(CLIENT_URI).then((response) => response.data);

export const createClientApi = (data) =>
  api.post(CLIENT_URI, data).then((response) => response.data);

export const updateClientApi = (data, client_id) =>
  api.put(`${CLIENT_URI}/${client_id}`, data).then((response) => response.data);

// Token and activation
export const generateTokenApi = (data) =>
  api.post(GENERATE_TOKEN_URI, data).then((response) => response.data);

export const activateUserClientApi = (data) =>
  api
    .post(`${ACTIVATE_USER_CLIENT}/${data._id}`, data)
    .then((response) => response.data);

export const activationRequestApi = (clientID) =>
  api
    .get(`${ACTIVATION_REQUEST_URI}/${clientID}`)
    .then((response) => response.data);
