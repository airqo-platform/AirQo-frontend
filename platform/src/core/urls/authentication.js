import { NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_API_TOKEN } from '../../lib/envConstants';
import { stripTrailingSlash } from '../utils/strings';

const BASE_AUTH_URL = stripTrailingSlash(NEXT_PUBLIC_API_BASE_URL);

export const AUTH_URL = `${BASE_AUTH_URL}/users`;

export const GOOGLE_AUTH_URL = `${BASE_AUTH_URL}/users/auth/google`;

export const LOGIN_URL = `${BASE_AUTH_URL}/users/loginUser`;

export const UPDATE_PWD_URL = `${BASE_AUTH_URL}/users/updatePassword`;

export const USERS_URL = AUTH_URL;

export const GROUPS_URL = `${AUTH_URL}/groups`;

export const UPDATE_USER_DETAILS_URL = AUTH_URL;

export const USER_DEFAULTS_URL = `${BASE_AUTH_URL}/users/defaults`;

export const USER_CHECKLISTS_URL = `${BASE_AUTH_URL}/users/checklist`;

export const USER_CHECKLISTS_UPSERT_URL = `${BASE_AUTH_URL}/users/checklist/upsert`;
