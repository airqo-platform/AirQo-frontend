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
  getUserThemeUrl,
  updateUserThemeUrl,
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

export const getOrganisationRequestsApi = () =>
  secureApiProxy
    .get(`${USERS_URL}/org-requests`, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

export const approveOrganisationRequestApi = (requestId) =>
  secureApiProxy
    .patch(
      `${USERS_URL}/org-requests/${requestId}/approve`,
      {},
      {
        authType: AUTH_TYPES.JWT,
      },
    )
    .then((response) => response.data);

export const rejectOrganisationRequestApi = (requestId, feedback) =>
  secureApiProxy
    .patch(
      `${USERS_URL}/org-requests/${requestId}/reject`,
      {
        rejection_reason: feedback,
      },
      { authType: AUTH_TYPES.JWT },
    )
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

// Theme Management APIs
/**
 * Get user theme preferences
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {string} tenant - Tenant identifier (defaults to 'airqo')
 * @returns {Promise} - Promise resolving to theme preferences
 */
export const getUserThemeApi = (userId, tenant = 'airqo') => {
  // Validate user ID
  if (!userId || typeof userId !== 'string') {
    return Promise.reject(new Error('Valid user ID is required'));
  }
  const params = { tenant };

  return secureApiProxy
    .get(getUserThemeUrl(userId), {
      params,
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Enhanced error handling
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch user theme';
      throw new Error(errorMessage);
    });
};

/**
 * Update user theme preferences (only sends changed properties)
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {Object} currentTheme - Current theme state
 * @param {Object} newTheme - New theme settings object
 * @param {string} tenant - Tenant identifier (defaults to 'airqo')
 * @returns {Promise} - Promise resolving to updated theme preferences
 */
export const updateUserThemeApi = (
  userId,
  currentTheme,
  newTheme,
  tenant = 'airqo',
) => {
  // Validate user ID
  if (!userId || typeof userId !== 'string') {
    return Promise.reject(new Error('Valid user ID is required'));
  }

  // Validate theme data
  if (!newTheme || typeof newTheme !== 'object') {
    return Promise.reject(new Error('Valid theme data is required'));
  }

  if (!currentTheme || typeof currentTheme !== 'object') {
    return Promise.reject(new Error('Valid current theme data is required'));
  }

  // Calculate the differences (only changed properties)
  const changedProperties = {};
  const validThemeKeys = [
    'primaryColor',
    'mode',
    'interfaceStyle',
    'contentLayout',
  ];

  validThemeKeys.forEach((key) => {
    if (newTheme[key] !== undefined && newTheme[key] !== currentTheme[key]) {
      changedProperties[key] = newTheme[key];
    }
  });

  // If no changes, return success without making API call
  if (Object.keys(changedProperties).length === 0) {
    return Promise.resolve({
      success: true,
      message: 'No changes to update',
      data: currentTheme,
    });
  }

  // Validate changed properties
  if (changedProperties.primaryColor) {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(changedProperties.primaryColor)) {
      return Promise.reject(
        new Error('Primary color must be in valid hex format'),
      );
    }
  }

  if (changedProperties.mode) {
    const validModes = ['light', 'dark', 'system'];
    if (!validModes.includes(changedProperties.mode)) {
      return Promise.reject(
        new Error('Mode must be one of: light, dark, system'),
      );
    }
  }

  if (changedProperties.interfaceStyle) {
    const validStyles = ['default', 'bordered'];
    if (!validStyles.includes(changedProperties.interfaceStyle)) {
      return Promise.reject(
        new Error('Interface style must be one of: default, bordered'),
      );
    }
  }

  if (changedProperties.contentLayout) {
    const validLayouts = ['compact', 'wide'];
    if (!validLayouts.includes(changedProperties.contentLayout)) {
      return Promise.reject(
        new Error('Content layout must be one of: compact, wide'),
      );
    }
  }

  // Wrap changes in theme object as required by backend
  const requestBody = {
    theme: changedProperties,
  };

  const params = { tenant };

  return secureApiProxy
    .put(updateUserThemeUrl(userId), requestBody, {
      params,
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Enhanced error handling
      const errorMessage =
        error.response?.data?.message || 'Failed to update user theme';
      throw new Error(errorMessage);
    });
};
