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
  FORGOT_PWD_URL,
  RESET_PWD_URL,
  MAINTENANCE_STATUS_URL,
  INQUIRY_REGISTER_URL,
} from '../urls/authentication';
import axios from 'axios';
import createAxiosInstance from './axiosConfig';

let jwtToken;
if (typeof window !== 'undefined') {
  jwtToken = window.localStorage.getItem('token');
}

axios.defaults.headers.common.Authorization = jwtToken;

export const forgotPasswordApi = async (data) => {
  const response = await createAxiosInstance().post(FORGOT_PWD_URL, data);
  return response.data;
};

export const resetPasswordApi = async (data) => {
  const response = await createAxiosInstance().put(RESET_PWD_URL, data);
  return response.data;
};

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

export const getUserDetails = async (userID) => {
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
    .post(`${USERS_URL}/requests/emails/groups/${groupID}`, {
      emails: userEmails,
    })
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
    const response = await axios.put(
      `${UPDATE_USER_DETAILS_URL}/${identifier}`,
      data,
    );
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
    const response = await createAxiosInstance().put(
      `${GROUPS_URL}/${data.grp_id}`,
      data,
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

// Post User Defaults
export const postUserDefaultsApi = async (data) => {
  const response = await createAxiosInstance().post(
    `${USER_DEFAULTS_URL}`,
    data,
  );
  return response.data;
};

// Update User Defaults
export const updateUserDefaultsApi = async (data) => {
  const response = await createAxiosInstance().put(
    `${USER_DEFAULTS_URL}`,
    data.sites,
    {
      params: {
        id: data.user_id,
      },
    },
  );
  return response.data;
};

// Verify user email
export const verifyUserEmailApi = async (identifier, token) => {
  const response = await createAxiosInstance().get(
    `${VERIFY_USER_URL}/${identifier}/${token}`,
  );
  return response.data;
};

// Post User Preferences
export const postUserPreferencesApi = async (data) => {
  const response = await createAxiosInstance().post(
    `${USER_PREFERENCES_URL}`,
    data,
  );
  return response.data;
};

// Update/Upsert User Preferences
export const updateUserPreferencesApi = async (data) => {
  const response = await createAxiosInstance().post(
    `${USER_PREFERENCES_URL}/upsert`,
    data,
  );
  return response.data;
};

// Get Individual User preferences
export const getUserPreferencesApi = async (identifier, groupID = null) => {
  try {
    const response = await createAxiosInstance().get(
      `${USER_PREFERENCES_URL}/${identifier}`,
      {
        params: groupID ? { group_id: groupID } : {},
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Patch/Replace User Preferences
export const patchUserPreferencesApi = async (data) => {
  const response = await createAxiosInstance().patch(
    `${USER_PREFERENCES_URL}/replace`,
    data,
  );
  return response.data;
};

// User Defaults
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

// User Checklist
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

// Group Details
export const getGroupDetailsApi = async (groupID) => {
  return await createAxiosInstance()
    .get(`${GROUPS_URL}/${groupID}`)
    .then((response) => response.data);
};

export const updateGroupDetailsApi = async (groupID, data) => {
  return await createAxiosInstance()
    .put(`${GROUPS_URL}/${groupID}`, data)
    .then((response) => response.data);
};

export const getMaintenanceStatus = async () => {
  try {
    const response = await createAxiosInstance().get(MAINTENANCE_STATUS_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching maintenance status:', error);
    throw error;
  }
};

export const registerInquiry = async (data) => {
  try {
    const response = await createAxiosInstance().post(
      INQUIRY_REGISTER_URL,
      data,
    );
    return response.data;
  } catch (error) {
    console.error('Error registering inquiry:', error);
    throw error;
  }
};
