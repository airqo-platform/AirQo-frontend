import { stripTrailingSlash } from '../utils';

const BASE_AUTH_SERVICE_URL = stripTrailingSlash(
  process.env.REACT_APP_BASE_AUTH_SERVICE_URL || process.env.REACT_APP_BASE_URL
);

export const VERIFY_TOKEN_URI = `${BASE_AUTH_SERVICE_URL}/users/reset/you`;

export const UPDATE_PWD_URI = `${BASE_AUTH_SERVICE_URL}/users/updatePasswordViaEmail`;

export const UPDATE_PWD_IN_URI = `${BASE_AUTH_SERVICE_URL}/users/updatePassword`;

export const FORGOT_PWD_URI = `${BASE_AUTH_SERVICE_URL}/users/forgotPassword`;

export const LOGIN_USER_URI = `${BASE_AUTH_SERVICE_URL}/users/loginUser`;

export const REGISTER_USER_URI = `${BASE_AUTH_SERVICE_URL}/users/registerUser`;

export const CANDIDATES_URI = `${BASE_AUTH_SERVICE_URL}/users/candidates`;

export const REGISTER_CANDIDATE_URI = `${BASE_AUTH_SERVICE_URL}/users/candidates/register`;

export const REJECT_USER_URI = `${BASE_AUTH_SERVICE_URL}/users/deny`;

export const ACCEPT_USER_URI = `${BASE_AUTH_SERVICE_URL}/users/accept`;

export const GET_USERS_URI = `${BASE_AUTH_SERVICE_URL}/users/`;

export const GET_CANDIDATES_URI = `${BASE_AUTH_SERVICE_URL}/users/candidates`;

export const DEFAULTS_URI = `${BASE_AUTH_SERVICE_URL}/users/defaults`;

export const CHART_DEFAULTS_URI = `${BASE_AUTH_SERVICE_URL}/users/defaults`;

export const CONFIRM_CANDIDATE_URI = `${BASE_AUTH_SERVICE_URL}/users/candidates/confirm`;

export const DELETE_CANDIDATE_URI = `${BASE_AUTH_SERVICE_URL}/users/candidates`;

export const USER_FEEDBACK_URI = `${BASE_AUTH_SERVICE_URL}/users/feedback`;
