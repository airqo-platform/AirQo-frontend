import { stripTrailingSlash } from '../utils';

export const BASE_AUTH_SERVICE_URL_V2 = stripTrailingSlash(process.env.REACT_APP_BASE_URL_V2);

export const VERIFY_TOKEN_URI = `${BASE_AUTH_SERVICE_URL_V2}/users/reset/you`;

export const UPDATE_PWD_URI = `${BASE_AUTH_SERVICE_URL_V2}/users/updatePasswordViaEmail`;

export const UPDATE_PWD_IN_URI = `${BASE_AUTH_SERVICE_URL_V2}/users/updatePassword`;

export const FORGOT_PWD_URI = `${BASE_AUTH_SERVICE_URL_V2}/users/forgotPassword`;

export const LOGIN_USER_URI = `${BASE_AUTH_SERVICE_URL_V2}/users/loginUser`;

export const REGISTER_USER_URI = `${BASE_AUTH_SERVICE_URL_V2}/users/registerUser`;

export const REJECT_USER_URI = `${BASE_AUTH_SERVICE_URL_V2}/users/deny`;

export const ACCEPT_USER_URI = `${BASE_AUTH_SERVICE_URL_V2}/users/accept`;

export const GET_USERS_URI = `${BASE_AUTH_SERVICE_URL_V2}/users`;

export const DEFAULTS_URI = `${BASE_AUTH_SERVICE_URL_V2}/users/defaults`;

export const CHART_DEFAULTS_URI = `${BASE_AUTH_SERVICE_URL_V2}/users/defaults`;

export const USER_FEEDBACK_URI = `${BASE_AUTH_SERVICE_URL_V2}/users/feedback`;

export const GET_ACCESS_TOKEN = `${BASE_AUTH_SERVICE_URL_V2}/users/tokens`;

export const GET_LOGS = `${BASE_AUTH_SERVICE_URL_V2}/users/logs`;

export const GET_MAINTENANCE_STATUS = `${BASE_AUTH_SERVICE_URL_V2}/users/maintenances/analytics`;
