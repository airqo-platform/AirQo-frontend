import { data } from 'autoprefixer';
import {
  AUTH_URL,
  GOOGLE_AUTH_URL,
  LOGIN_URL,
  USERS_URL,
  GROUPS_URL,
  UPDATE_USER_DETAILS_URL,
} from '../urls/authentication';
import axios from 'axios';
import { NEXT_PUBLIC_API_TOKEN } from '../../lib/envConstants';

let jwtToken;
let accessToken;
if (typeof window !== 'undefined') {
  jwtToken = window.localStorage.getItem('token');
} else if (!jwtToken) {
  accessToken = NEXT_PUBLIC_API_TOKEN;
}

axios.defaults.headers.common.Authorization = jwtToken;

export const postUserCreationDetails = async (data) =>
  await axios
    .post(AUTH_URL, data, { params: { token: NEXT_PUBLIC_API_TOKEN } })
    .then((response) => response.data);

export const getGoogleAuthDetails = async () => {
  await axios.get(GOOGLE_AUTH_URL);
};

export const postUserLoginDetails = async (data) => {
  return await axios
    .post(LOGIN_URL, data, { params: { token: NEXT_PUBLIC_API_TOKEN } })
    .then((response) => response.data);
};

export const getUserDetails = async (userID) => {
  return await axios
    .get(`${USERS_URL}/${userID}`, { params: { token: NEXT_PUBLIC_API_TOKEN } })
    .then((response) => response.data);
};

export const getAssignedGroupMembers = async (groupID) => {
  return await axios
    .get(`${GROUPS_URL}/${groupID}/assigned-users`, { params: { token: NEXT_PUBLIC_API_TOKEN } })
    .then((response) => response.data);
};

export const inviteUserToGroupTeam = async (groupID, userEmails) => {
  return await axios
    .post(
      `${USERS_URL}/requests/emails/groups/${groupID}`,
      { emails: userEmails },
      { params: { token: NEXT_PUBLIC_API_TOKEN } },
    )
    .then((response) => response.data);
};

export const acceptGroupTeamInvite = async (body) => {
  return await axios
    .post(`${USERS_URL}/requests/emails/accept`, body, { params: { token: NEXT_PUBLIC_API_TOKEN } })
    .then((response) => response.data);
};

export const updateUserCreationDetails = async (data, identifier) => {
  await axios
    .put(`${UPDATE_USER_DETAILS_URL}/${identifier}`, data, {
      params: { token: NEXT_PUBLIC_API_TOKEN },
    })
    .then((response) => response.data);
};
