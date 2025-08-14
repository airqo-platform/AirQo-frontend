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
  getGroupSlugUrl,
  GROUP_ROLES_URL,
} from '../urls/authentication';
import { secureApiProxy, AUTH_TYPES } from '../utils/secureApiProxyClient';
import { openApiMethods } from '../utils/openApiClient';

// Get Users
export const getUsersApi = () =>
  secureApiProxy
    .get(USERS_URL, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

// Get User analytics
export const getUsersAnalyticsApi = () =>
  secureApiProxy
    .get(`${USERS_URL}/stats`, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

// Password Management
export const forgotPasswordApi = (data) =>
  openApiMethods.post(FORGOT_PWD_URL, data);

export const resetPasswordApi = (data) =>
  openApiMethods.put(RESET_PWD_URL, data);

// Authentication
export const postUserCreationDetails = (data) =>
  openApiMethods.post(AUTH_URL, data);

export const getGoogleAuthDetails = () =>
  secureApiProxy
    .get(GOOGLE_AUTH_URL, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

export const postUserLoginDetails = (data) =>
  openApiMethods.post(LOGIN_URL, data);

// User Management
export const getUserDetails = (userID) => {
  if (!userID) {
    return Promise.reject(new Error('User ID is required'));
  }

  return secureApiProxy
    .get(`${USERS_URL}/${userID}`, {
      authType: AUTH_TYPES.JWT,
      timeout: 15000, // 15 second timeout
    })
    .then((response) => response.data)
    .catch((error) => {
      // Enhanced error handling
      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || 'Failed to fetch user details';

        switch (status) {
          case 404:
            throw new Error('User not found');
          case 403:
            throw new Error('Access denied');
          case 401:
            throw new Error('Authentication required');
          case 500:
            throw new Error('Server error occurred');
          default:
            throw new Error(message);
        }
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error(error.message || 'Failed to fetch user details');
      }
    });
};

export const updateUserCreationDetails = (data, identifier) =>
  secureApiProxy
    .put(`${UPDATE_USER_DETAILS_URL}/${identifier}`, data, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const updateUserCreationDetailsWithToken = (data, identifier) =>
  secureApiProxy
    .put(`${UPDATE_USER_DETAILS_URL}/${identifier}`, data, {
      authType: AUTH_TYPES.API_TOKEN,
    })
    .then((response) => response.data);

// Group Management
export const getAssignedGroupMembers = (groupID) =>
  secureApiProxy
    .get(`${GROUPS_URL}/${groupID}/assigned-users`, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

// Accepts groupID and a body object (e.g., { emails: [...] })
export const inviteUserToGroupTeam = (groupID, body) =>
  secureApiProxy
    .post(`${USERS_URL}/requests/emails/groups/${groupID}`, body, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data);

export const removeUserFromGroup = (groupID, userID) =>
  secureApiProxy
    .delete(`${GROUPS_URL}/${groupID}/users/${userID}`, {
      authType: AUTH_TYPES.JWT,
    })
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
      authType: AUTH_TYPES.NONE,
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

// Group Slug Management
export const updateGroupSlugApi = (groupId, data) =>
  secureApiProxy
    .put(getGroupSlugUrl(groupId), data, {
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

export const postUserPreferencesApiWithToken = (data) =>
  secureApiProxy
    .post(`${USER_PREFERENCES_URL}`, data, { authType: AUTH_TYPES.API_TOKEN })
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

export const patchUserPreferencesApiWithToken = (data) =>
  secureApiProxy
    .patch(`${USER_PREFERENCES_URL}/replace`, data, {
      authType: AUTH_TYPES.API_TOKEN,
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
 * @param {string} groupId - MongoDB ObjectId of the group
 * @returns {Promise} - Promise resolving to theme preferences
 */
export const getUserThemeApi = (userId, groupId) => {
  // Validate user ID and group ID
  if (!userId || typeof userId !== 'string') {
    return Promise.reject(new Error('Valid user ID is required'));
  }
  if (!groupId || typeof groupId !== 'string') {
    return Promise.reject(new Error('Valid group ID is required'));
  }

  return secureApiProxy
    .get(getUserThemeUrl(userId, groupId), {
      authType: AUTH_TYPES.JWT,
      timeout: 10000, // 10 second timeout
    })
    .then((response) => response.data)
    .catch((error) => {
      // Enhanced error handling with fallback
      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 404:
            // User theme not found - return default theme
            logger.info('User theme not found, using defaults');
            return { theme: null }; // Let the caller handle defaults
          case 403:
          case 401:
            logger.warn('Authentication issue when fetching theme');
            return { theme: null };
          default:
            logger.error('Theme API error:', error);
            return { theme: null };
        }
      }
      logger.error('Network error fetching theme:', error);
      return { theme: null };
    });
};

/**
 * Update user theme preferences (sends all theme properties)
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {string} groupId - MongoDB ObjectId of the group
 * @param {Object} currentTheme - Current theme state
 * @param {Object} newTheme - New theme settings object
 * @returns {Promise} - Promise resolving to updated theme preferences
 */
export const updateUserThemeApi = (userId, groupId, currentTheme, newTheme) => {
  // Validate user ID and group ID
  if (!userId || typeof userId !== 'string') {
    return Promise.reject(new Error('Valid user ID is required'));
  }
  if (!groupId || typeof groupId !== 'string') {
    return Promise.reject(new Error('Valid group ID is required'));
  }

  // Validate theme data
  if (!newTheme || typeof newTheme !== 'object') {
    return Promise.reject(new Error('Valid theme data is required'));
  }

  if (!currentTheme || typeof currentTheme !== 'object') {
    return Promise.reject(new Error('Valid current theme data is required'));
  }

  // Build complete theme object with all four properties
  const validThemeKeys = [
    'primaryColor',
    'mode',
    'interfaceStyle',
    'contentLayout',
  ];
  const completeTheme = {};
  validThemeKeys.forEach((key) => {
    // Use new value if provided, otherwise use current value
    completeTheme[key] =
      newTheme[key] !== undefined ? newTheme[key] : currentTheme[key];
  });

  // Check if there are any actual changes for early return optimization
  const hasChanges = validThemeKeys.some(
    (key) => newTheme[key] !== undefined && newTheme[key] !== currentTheme[key],
  );

  // If no changes, return success without making API call
  if (!hasChanges) {
    return Promise.resolve({
      success: true,
      message: 'No changes to update',
      data: currentTheme,
    });
  }
  // Validate complete theme properties
  if (completeTheme.primaryColor) {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(completeTheme.primaryColor)) {
      return Promise.reject(
        new Error('Primary color must be in valid hex format'),
      );
    }
  }

  if (completeTheme.mode) {
    const validModes = ['light', 'dark', 'system'];
    if (!validModes.includes(completeTheme.mode)) {
      return Promise.reject(
        new Error('Mode must be one of: light, dark, system'),
      );
    }
  }

  if (completeTheme.interfaceStyle) {
    const validStyles = ['default', 'bordered'];
    if (!validStyles.includes(completeTheme.interfaceStyle)) {
      return Promise.reject(
        new Error('Interface style must be one of: default, bordered'),
      );
    }
  }

  if (completeTheme.contentLayout) {
    const validLayouts = ['compact', 'wide'];
    if (!validLayouts.includes(completeTheme.contentLayout)) {
      return Promise.reject(
        new Error('Content layout must be one of: compact, wide'),
      );
    }
  }

  // Wrap complete theme in theme object as required by backend
  const requestBody = {
    theme: completeTheme,
  };

  return secureApiProxy
    .put(updateUserThemeUrl(userId, groupId), requestBody, {
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

// Group Roles
/**
 * Get roles for a group
 * @param {string} groupId - The group ID to fetch roles for
 * @returns {Promise} - Promise resolving to group roles
 */
export const getGroupRolesApi = (groupId) => {
  if (!groupId || typeof groupId !== 'string') {
    return Promise.reject(new Error('Valid group ID is required'));
  }
  return secureApiProxy
    .get(GROUP_ROLES_URL, {
      params: { group_id: groupId },
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data)
    .catch((error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch group roles';
      throw new Error(errorMessage);
    });
};

// Create a new role for a group POST REQUEST
export const createGroupRoleApi = (data) => {
  if (!data || typeof data !== 'object') {
    return Promise.reject(new Error('Valid role data is required'));
  }
  if (!data.role_name || typeof data.role_name !== 'string') {
    return Promise.reject(new Error('Role name is required'));
  }
  if (!data.group_id || typeof data.group_id !== 'string') {
    return Promise.reject(new Error('Group ID is required'));
  }

  return secureApiProxy
    .post(GROUP_ROLES_URL, data, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data)
    .catch((error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to create group role';
      throw new Error(errorMessage);
    });
};

// Update an existing role for a group PUT REQUEST
export const updateGroupRoleApi = (roleId, data) => {
  if (!roleId || typeof roleId !== 'string') {
    return Promise.reject(new Error('Valid role ID is required'));
  }
  if (!data || typeof data !== 'object') {
    return Promise.reject(new Error('Valid role data is required'));
  }
  if (!data.role_name || typeof data.role_name !== 'string') {
    return Promise.reject(new Error('Role name is required'));
  }

  return secureApiProxy
    .put(`${GROUP_ROLES_URL}/${roleId}`, data, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data)
    .catch((error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to update group role';
      throw new Error(errorMessage);
    });
};

// Delete a role for a group DELETE REQUEST
export const deleteGroupRoleApi = (roleId) => {
  if (!roleId || typeof roleId !== 'string') {
    return Promise.reject(new Error('Valid role ID is required'));
  }

  return secureApiProxy
    .delete(`${GROUP_ROLES_URL}/${roleId}`, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data)
    .catch((error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete group role';
      throw new Error(errorMessage);
    });
};

// Update role permissions
export const updateRolePermissionsApi = (roleId, body) => {
  if (!roleId || typeof roleId !== 'string') {
    return Promise.reject(new Error('Valid role ID is required'));
  }
  if (!body || typeof body !== 'object') {
    return Promise.reject(new Error('Valid permissions data is required'));
  }

  return secureApiProxy
    .put(`${GROUP_ROLES_URL}/${roleId}/permissions`, body, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data)
    .catch((error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to update role permissions';
      throw new Error(errorMessage);
    });
};

// get all permissions list
export const getAllPermissionsApi = () =>
  secureApiProxy
    .get(`${USERS_URL}/permissions`, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data)
    .catch((error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch permissions';
      throw new Error(errorMessage);
    });

// Get role details by ID
export const getRoleDetailsApi = (roleId) => {
  if (!roleId || typeof roleId !== 'string') {
    return Promise.reject(new Error('Valid role ID is required'));
  }

  return secureApiProxy
    .get(`${GROUP_ROLES_URL}/${roleId}`, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data)
    .catch((error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch role details';
      throw new Error(errorMessage);
    });
};

// Assign a role to a user POST REQUEST
export const assignRoleToUserApi = (roleId, body) => {
  if (!roleId || typeof roleId !== 'string') {
    return Promise.reject(new Error('Valid role ID is required'));
  }
  if (!body || typeof body !== 'object') {
    return Promise.reject(new Error('Valid user data is required'));
  }
  if (!body.user || typeof body.user !== 'string') {
    return Promise.reject(new Error('User ID is required'));
  }

  return secureApiProxy
    .post(`${GROUP_ROLES_URL}/${roleId}/user`, body, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data)
    .catch((error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to assign role to user';
      throw new Error(errorMessage);
    });
};

// Get user's permissions for different groups
export const getUserGroupPermissionsApi = () =>
  secureApiProxy
    .get(`${USERS_URL}/roles/me/roles-simplified`, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data)
    .catch((error) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to fetch user group permissions';
      throw new Error(errorMessage);
    });

// Get analytics for a group
/**
 * Fetch analytics for a specific group
 * @param {string} groupId - The group ID
 * @returns {Promise} - Promise resolving to group analytics data
 */
export const getGroupAnalyticsApi = (groupId) => {
  if (!groupId || typeof groupId !== 'string') {
    return Promise.reject(new Error('Valid group ID is required'));
  }
  return secureApiProxy
    .get(`${GROUPS_URL}/${groupId}/analytics`, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data)
    .catch((error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch group analytics';
      throw new Error(errorMessage);
    });
};
