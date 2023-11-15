import {
  AUTH_URL,
  GOOGLE_AUTH_URL,
  LOGIN_URL,
  USERS_URL,
  GROUPS_URL,
  UPDATE_USER_DETAILS_URL,
  USER_DEFAULTS_URL,
  VERIFY_USER_URL,
  USER_PREFERENCES_URL,
  USER_CHECKLISTS_UPSERT_URL,
  USER_CHECKLISTS_URL,
} from '../urls/authentication';
import axios from 'axios';
import createAxiosInstance from './axiosConfig';

let jwtToken;
if (typeof window !== 'undefined') {
  jwtToken = window.localStorage.getItem('token');
}

const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

axios.defaults.headers.common.Authorization = jwtToken;

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
  try {
    const response = await axios.put(`${UPDATE_USER_DETAILS_URL}/${identifier}`, data);
    return response.data;
  } catch (error) {
    return error;
  }
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
export const updateOrganisationApi = async (data) => {
  try {
    const response = await createAxiosInstance().put(`${GROUPS_URL}/${data.grp_id}`, data);
    return response.data;
  } catch (error) {
    return error;
  }
};

// Post User Defaults
export const postUserDefaultsApi = async (data) => {
  try {
    const response = await createAxiosInstance().post(`${USER_DEFAULTS_URL}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update User Defaults
export const updateUserDefaultsApi = async (data) => {
  try {
    const response = await createAxiosInstance().put(`${USER_DEFAULTS_URL}`, data.sites, {
      params: {
        id: data.user_id,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify user email
export const verifyUserEmailApi = async (identifier, token) => {
  try {
    const response = await createAxiosInstance().get(`${VERIFY_USER_URL}/${identifier}/${token}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Post User Preferences
export const postUserPreferencesApi = async (data) => {
  try {
    const response = await createAxiosInstance().post(`${USER_PREFERENCES_URL}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update User Preferences
export const updateUserPreferencesApi = async (data) => {
  try {
    const response = await createAxiosInstance().put(
      `${USER_PREFERENCES_URL}/${data.user_id}`,
      data.sites,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getUserDefaults = async () => {
  return await createAxiosInstance()
    .get(USER_DEFAULTS_URL)
    .then((response) => response.data);
};

export const updateUserDefaults = async (defaultsId, defaults) => {
  return await createAxiosInstance()
    .put(USER_DEFAULTS_URL, defaults, {
      params: {
        id: defaultsId,
      },
    })
    .then((response) => response.data);
};

export const getUserChecklists = async (userID) => {
  return await createAxiosInstance()
    .get(`${USER_CHECKLISTS_URL}/${userID}`)
    .then((response) => response.data);
};

export const upsertUserChecklists = async (checklist) => {
  return await createAxiosInstance()
    .post(USER_CHECKLISTS_UPSERT_URL, checklist)
    .then((response) => response.data);
};

export const getGroupDetailsApi = async (groupID) => {
  return await createAxiosInstance()
    .get(`${GROUPS_URL}/${groupID}`)
    .then((response) => response.data);
};
