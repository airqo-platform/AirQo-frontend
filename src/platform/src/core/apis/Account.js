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
} from '../urls/authentication';
import { api } from '../utils/apiClient';

// Password Management
export const forgotPasswordApi = (data) =>
  api.post(FORGOT_PWD_URL, data).then((response) => response.data);
export const resetPasswordApi = (data) =>
  api.put(RESET_PWD_URL, data).then((response) => response.data);

// Authentication
export const postUserCreationDetails = (data) =>
  api.post(AUTH_URL, data).then((response) => response.data);

export const getGoogleAuthDetails = () => api.get(GOOGLE_AUTH_URL);

export const postUserLoginDetails = (data) =>
  api.post(LOGIN_URL, data).then((response) => response.data);

// User Management
export const getUserDetails = (userID) =>
  api.get(`${USERS_URL}/${userID}`).then((response) => response.data);
export const updateUserCreationDetails = (data, identifier) =>
  api
    .put(`${UPDATE_USER_DETAILS_URL}/${identifier}`, data)
    .then((response) => response.data);

// Group Management
export const getAssignedGroupMembers = (groupID) =>
  api
    .get(`${GROUPS_URL}/${groupID}/assigned-users`)
    .then((response) => response.data);
export const inviteUserToGroupTeam = (groupID, userEmails) =>
  api
    .post(`${USERS_URL}/requests/emails/groups/${groupID}`, {
      emails: userEmails,
    })
    .then((response) => response.data);
export const acceptGroupTeamInvite = (body) =>
  api
    .post(`${USERS_URL}/requests/emails/accept`, body)
    .then((response) => response.data);
export const createOrganisation = (data) =>
  api.post(`${GROUPS_URL}`, data).then((response) => response.data);
export const updateOrganisationApi = (data) =>
  api
    .put(`${GROUPS_URL}/${data.grp_id}`, data)
    .then((response) => response.data);
export const getGroupDetailsApi = (groupID) =>
  api.get(`${GROUPS_URL}/${groupID}`).then((response) => response.data);
export const updateGroupDetailsApi = (groupID, data) =>
  api.put(`${GROUPS_URL}/${groupID}`, data).then((response) => response.data);

// User Defaults
export const postUserDefaultsApi = (data) =>
  api.post(`${USER_DEFAULTS_URL}`, data).then((response) => response.data);
export const updateUserDefaultsApi = (data) =>
  api
    .put(`${USER_DEFAULTS_URL}`, data.sites, { params: { id: data.user_id } })
    .then((response) => response.data);
export const getUserDefaults = () =>
  api.get(USER_DEFAULTS_URL).then((response) => response.data);
export const updateUserDefaults = (defaultsId, defaults) =>
  api
    .put(USER_DEFAULTS_URL, defaults, { params: { id: defaultsId } })
    .then((response) => response.data);

// Email Verification
export const verifyUserEmailApi = (identifier, token) =>
  api
    .get(`${VERIFY_USER_URL}/${identifier}/${token}`)
    .then((response) => response.data);

// User Preferences
export const postUserPreferencesApi = (data) =>
  api.post(`${USER_PREFERENCES_URL}`, data).then((response) => response.data);
export const updateUserPreferencesApi = (data) =>
  api
    .post(`${USER_PREFERENCES_URL}/upsert`, data)
    .then((response) => response.data);
export const getUserPreferencesApi = (identifier, groupID = null) => {
  const params = groupID ? { group_id: groupID } : {};
  return api
    .get(`${USER_PREFERENCES_URL}/${identifier}`, { params })
    .then((response) => response.data);
};
export const patchUserPreferencesApi = (data) =>
  api
    .patch(`${USER_PREFERENCES_URL}/replace`, data)
    .then((response) => response.data);

export const recentUserPreferencesAPI = (identifier) => {
  return api
    .get(`${USER_PREFERENCES_URL}/recent/${identifier}`)
    .then((response) => response.data);
};

// User Checklists
export const getUserChecklists = (userID) =>
  api.get(`${USER_CHECKLISTS_URL}/${userID}`).then((response) => response.data);

export const upsertUserChecklists = (checklist) =>
  api
    .post(USER_CHECKLISTS_UPSERT_URL, checklist)
    .then((response) => response.data);

// System Status
export const getMaintenanceStatus = () =>
  api.get(MAINTENANCE_STATUS_URL).then((response) => response.data);
