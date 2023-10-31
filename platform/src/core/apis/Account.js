import {
  AUTH_URL,
  GOOGLE_AUTH_URL,
  LOGIN_URL,
  USERS_URL,
  GROUPS_URL,
  UPDATE_USER_DETAILS_URL,
} from '../urls/authentication';
import axios from 'axios';

let jwtToken;
if (typeof window !== 'undefined') {
  jwtToken = window.localStorage.getItem('token');
}

axios.defaults.headers.common.Authorization = jwtToken;

// Register User Details
export const postUserCreationDetails = async (data) =>
  await axios.post(AUTH_URL, data).then((response) => response.data);

export const getGoogleAuthDetails = async () => {
  await axios.get(GOOGLE_AUTH_URL);
};
// User Login
export const postUserLoginDetails = async (data) => {
  return await axios.post(LOGIN_URL, data).then((response) => response.data);
};

export const getUserDetails = async (userID, token) => {
  axios.defaults.headers.common.Authorization = token;
  return await axios.get(`${USERS_URL}/${userID}`).then((response) => response.data);
};

export const getAssignedGroupMembers = async (groupID) => {
  return await axios
    .get(`${GROUPS_URL}/${groupID}/assigned-users`)
    .then((response) => response.data);
};

export const inviteUserToGroupTeam = async (groupID, userEmails) => {
  return await axios
    .post(`${USERS_URL}/requests/emails/groups/${groupID}`, { emails: userEmails })
    .then((response) => response.data);
};

export const acceptGroupTeamInvite = async (body) => {
  return await axios
    .post(`${USERS_URL}/requests/emails/accept`, body)
    .then((response) => response.data);
};

// Update [Individual]User Details
export const updateUserCreationDetails = async (data, identifier) => {
  await axios
    .put(`${UPDATE_USER_DETAILS_URL}/${identifier}`, data)
    .then((response) => response.data);
};

// Create Organisation
export const createOrganisation = async (data) => {
  try {
    const response = await axios.post(`${GROUPS_URL}`, data)
    return response.data;
  } catch (error) {
    return error
  }
}

// Update Organisation
export const updateOrganisationApi = async (data, identifier) => {
  try {
    const response = await axios.put(`${GROUPS_URL}/${data.grp_id}`, data)
    return response.data;
  } catch (error) {
    return error
  }
}
