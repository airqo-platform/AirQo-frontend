export const AUTH_URL = '/users';
export const GOOGLE_AUTH_URL = '/users/auth/google';
export const LOGIN_URL = `${AUTH_URL}/login-with-details`;
export const UPDATE_PWD_URL = '/users/updatePassword';
export const USERS_URL = AUTH_URL;
export const GROUPS_URL = `${AUTH_URL}/groups`;
export const UPDATE_USER_DETAILS_URL = AUTH_URL;
export const USER_DEFAULTS_URL = `${AUTH_URL}/defaults`;
export const VERIFY_USER_URL = `${AUTH_URL}/verify`;
export const USER_PREFERENCES_URL = `${AUTH_URL}/preferences`;
export const USER_CHECKLISTS_URL = `${AUTH_URL}/checklist`;
export const USER_CHECKLISTS_UPSERT_URL = `${AUTH_URL}/checklist/upsert`;
export const FORGOT_PWD_URL = `${AUTH_URL}/forgotPassword`;
export const RESET_PWD_URL = `${AUTH_URL}/updatePasswordViaEmail`;
export const CLIENT_URI = `${AUTH_URL}/clients`;
export const GENERATE_TOKEN_URI = `${AUTH_URL}/tokens`;
export const ACTIVATE_USER_CLIENT = `${CLIENT_URI}/activate`;
export const ACTIVATION_REQUEST_URI = `${CLIENT_URI}/activate-request`;
export const MAINTENANCE_STATUS_URL = `${AUTH_URL}/maintenances/analytics`;

// Group roles URL
export const GROUP_ROLES_URL = `${AUTH_URL}/roles`;

// Group slug management URL
export const getGroupSlugUrl = (groupId) => `${GROUPS_URL}/${groupId}/slug`;

// Theme Management URLs
export const USER_THEME_BASE_URL = `${USERS_URL}/preferences/theme/user`;
export const getUserThemeUrl = (userId, groupId) =>
  `${USER_THEME_BASE_URL}/${userId}/group/${groupId}`;
export const updateUserThemeUrl = (userId, groupId) =>
  `${USER_THEME_BASE_URL}/${userId}/group/${groupId}`;
