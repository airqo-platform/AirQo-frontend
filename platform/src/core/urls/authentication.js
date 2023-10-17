import { NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_API_TOKEN } from '../../lib/envConstants';
import { stripTrailingSlash } from '../utils/strings';

const BASE_AUTH_URL = stripTrailingSlash(NEXT_PUBLIC_API_BASE_URL);

export const AUTH_URL = `${BASE_AUTH_URL}/users?token=${NEXT_PUBLIC_API_TOKEN}`;

export const GOOGLE_AUTH_URL = `${BASE_AUTH_URL}/users/auth/google`;

export const LOGIN_URL = `${BASE_AUTH_URL}/users/loginUser?token=${NEXT_PUBLIC_API_TOKEN}`;

export const UPDATE_PWD_URL = `${BASE_AUTH_URL}/users/updatePassword?token=${NEXT_PUBLIC_API_TOKEN}`;
