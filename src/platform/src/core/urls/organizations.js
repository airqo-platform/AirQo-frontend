import { NEXT_PUBLIC_API_BASE_URL } from '../../lib/envConstants';

// Base organization URLs
export const ORGANIZATIONS_BASE_URL = `${NEXT_PUBLIC_API_BASE_URL}/organizations`;

// Organization management endpoints
export const ORGANIZATIONS_URL = ORGANIZATIONS_BASE_URL;
export const ORGANIZATION_BY_SLUG_URL = (slug) =>
  `${ORGANIZATIONS_BASE_URL}/slug/${slug}`;
export const ORGANIZATION_THEME_URL = (slug) =>
  `${ORGANIZATIONS_BASE_URL}/slug/${slug}/theme`;
export const ORGANIZATION_REGISTER_URL = (slug) =>
  `${ORGANIZATIONS_BASE_URL}/slug/${slug}/register`;
export const ORGANIZATION_LOGIN_URL = (slug) =>
  `${ORGANIZATIONS_BASE_URL}/slug/${slug}/login`;
export const ORGANIZATION_ACCESS_URL = (orgId, userId) =>
  `${ORGANIZATIONS_BASE_URL}/${orgId}/access/${userId}`;

// Organization user management
export const ORG_USERS_URL = (orgId) =>
  `${ORGANIZATIONS_BASE_URL}/${orgId}/users`;
export const ORG_USER_ROLES_URL = (orgId, userId) =>
  `${ORGANIZATIONS_BASE_URL}/${orgId}/users/${userId}/roles`;

// Organization settings
export const ORG_SETTINGS_URL = (orgId) =>
  `${ORGANIZATIONS_BASE_URL}/${orgId}/settings`;
export const ORG_BRANDING_URL = (orgId) =>
  `${ORGANIZATIONS_BASE_URL}/${orgId}/branding`;
