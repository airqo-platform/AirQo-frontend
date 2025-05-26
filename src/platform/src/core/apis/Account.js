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
import { secureApiProxy, AUTH_TYPES } from '../utils/secureApiProxyClient';

// Password Management
export const forgotPasswordApi = (data) =>
  secureApiProxy
    .post(FORGOT_PWD_URL, data, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

export const resetPasswordApi = (data) =>
  secureApiProxy
    .put(RESET_PWD_URL, data, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

// Authentication
export const postUserCreationDetails = (data) =>
  secureApiProxy
    .post(AUTH_URL, data, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

export const getGoogleAuthDetails = () =>
  secureApiProxy
    .get(GOOGLE_AUTH_URL, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

export const postUserLoginDetails = (data) =>
  secureApiProxy
    .post(LOGIN_URL, data, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

// User Management
export const getUserDetails = (userID) =>
  secureApiProxy
    .get(`${USERS_URL}/${userID}`, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

export const updateUserCreationDetails = (data, identifier) =>
  secureApiProxy
    .put(`${UPDATE_USER_DETAILS_URL}/${identifier}`, data, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

// Group Management
export const getAssignedGroupMembers = (groupID) =>
  secureApiProxy
    .get(`${GROUPS_URL}/${groupID}/assigned-users`, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const inviteUserToGroupTeam = (groupID, userEmails) =>
  secureApiProxy
    .post(
      `${USERS_URL}/requests/emails/groups/${groupID}`,
      { emails: userEmails },
      { authType: AUTH_TYPES.JWT },
    )
    .then((response) => response.data);

export const acceptGroupTeamInvite = (body) =>
  secureApiProxy
    .post(`${USERS_URL}/requests/emails/accept`, body, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const createOrganisation = (data) =>
  secureApiProxy
    .post(`${GROUPS_URL}`, data, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

export const updateOrganisationApi = (data) =>
  secureApiProxy
    .put(`${GROUPS_URL}/${data.grp_id}`, data, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const getGroupDetailsApi = (groupID) =>
  secureApiProxy
    .get(`${GROUPS_URL}/${groupID}`, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

export const updateGroupDetailsApi = (groupID, data) =>
  secureApiProxy
    .put(`${GROUPS_URL}/${groupID}`, data, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

export const createOrganisationRequestApi = (data) =>
  secureApiProxy
    .post(`${USERS_URL}/org-requests`, data, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const getOrganisationSlugAvailabilityApi = (slug) =>
  secureApiProxy
    .get(`${USERS_URL}/org-requests/slug-availability/${slug}`, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

// User Defaults
export const postUserDefaultsApi = (data) =>
  secureApiProxy
    .post(`${USER_DEFAULTS_URL}`, data, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

export const updateUserDefaultsApi = (data) =>
  secureApiProxy
    .put(`${USER_DEFAULTS_URL}`, data.sites, {
      params: { id: data.user_id },
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const getUserDefaults = () =>
  secureApiProxy
    .get(USER_DEFAULTS_URL, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

export const updateUserDefaults = (defaultsId, defaults) =>
  secureApiProxy
    .put(USER_DEFAULTS_URL, defaults, {
      params: { id: defaultsId },
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

// Email Verification
export const verifyUserEmailApi = (identifier, token) =>
  secureApiProxy
    .get(`${VERIFY_USER_URL}/${identifier}/${token}`, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

// User Preferences
export const postUserPreferencesApi = (data) =>
  secureApiProxy
    .post(`${USER_PREFERENCES_URL}`, data, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

export const updateUserPreferencesApi = (data) =>
  secureApiProxy
    .post(`${USER_PREFERENCES_URL}/upsert`, data, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const getUserPreferencesApi = (identifier, groupID = null) => {
  const params = groupID ? { group_id: groupID } : {};
  return secureApiProxy
    .get(`${USER_PREFERENCES_URL}/${identifier}`, {
      params,
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);
};

export const patchUserPreferencesApi = (data) =>
  secureApiProxy
    .patch(`${USER_PREFERENCES_URL}/replace`, data, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const recentUserPreferencesAPI = (identifier) =>
  secureApiProxy
    .get(`${USER_PREFERENCES_URL}/recent/${identifier}`, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

// User Checklists
export const getUserChecklists = (userID) =>
  secureApiProxy
    .get(`${USER_CHECKLISTS_URL}/${userID}`, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const upsertUserChecklists = (checklist) =>
  secureApiProxy
    .post(USER_CHECKLISTS_UPSERT_URL, checklist, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

// System Status
export const getMaintenanceStatus = () =>
  secureApiProxy
    .get(MAINTENANCE_STATUS_URL, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);
