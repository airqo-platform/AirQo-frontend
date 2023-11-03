import {
  AUTH_URL,
  GOOGLE_AUTH_URL,
  LOGIN_URL,
  USERS_URL,
  GROUPS_URL,
  UPDATE_USER_DETAILS_URL,
  USER_DEFAULTS_URL,
} from '../urls/authentication';
import createAxiosInstance from './axiosConfig';

// Register User Details
export const postUserCreationDetails = async (data) => {
  return await createAxiosInstance()
    .post(AUTH_URL, data)
    .then((response) => response.data);
};

export const getGoogleAuthDetails = async () => {
  return await createAxiosInstance().get(GOOGLE_AUTH_URL);
};

// User Login
export const postUserLoginDetails = async (data) => {
  return await createAxiosInstance()
    .post(LOGIN_URL, data)
    .then((response) => response.data);
};

export const getUserDetails = async (userID, token) => {
  return await createAxiosInstance()
    .get(`${USERS_URL}/${userID}`)
    .then((response) => response.data);
};

export const getAssignedGroupMembers = async (groupID) => {
  return await createAxiosInstance()
    .get(`${GROUPS_URL}/${groupID}/assigned-users`)
    .then((response) => response.data);
};

export const inviteUserToGroupTeam = async (groupID, userEmails) => {
  return await createAxiosInstance()
    .post(`${USERS_URL}/requests/emails/groups/${groupID}`, { emails: userEmails })
    .then((response) => response.data);
};

export const acceptGroupTeamInvite = async (body) => {
  return await createAxiosInstance()
    .post(`${USERS_URL}/requests/emails/accept`, body)
    .then((response) => response.data);
};

// Update [Individual]User Details
export const updateUserCreationDetails = async (data, identifier) => {
  return await createAxiosInstance()
    .put(`${UPDATE_USER_DETAILS_URL}/${identifier}`, data)
    .then((response) => response.data);
};

// Create Organisation
export const createOrganisation = async (data) => {
  try {
    const response = await createAxiosInstance().post(`${GROUPS_URL}`, data);
    return response.data;
  } catch (error) {
    return error;
  }
};

// Update Organisation
export const updateOrganisationApi = async (data, identifier) => {
  try {
    const response = await createAxiosInstance().put(`${GROUPS_URL}/${data.grp_id}`, data);
    return response.data;
  } catch (error) {
    return error;
  }
};

export const getUserDefaults = async () => {
  return await createAxiosInstance()
    .get(USER_DEFAULTS_URL)
    .then((response) => response.data);
};

export const updateUserDefaults = async (userId, defaults) => {
  return await createAxiosInstance()
    .put(USER_DEFAULTS_URL, defaults, {
      params: {
        id: userId,
      },
    })
    .then((response) => response.data);
};
