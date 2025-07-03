import { NEXT_PUBLIC_API_BASE_URL } from '../../lib/envConstants';
import { normalizeUrl } from '../utils/urlHelpers';

// Base URLs
export const USERS_BASE_URL = `${normalizeUrl(NEXT_PUBLIC_API_BASE_URL)}/users`;

// Theme preferences endpoint
export const ORGANIZATION_THEME_PREFERENCES_URL = (groupId) =>
  `users/preferences/theme/organization/${groupId}`;

// Organization theme and branding endpoints
export const ORGANIZATION_THEME_URL = (orgSlug) =>
  `${USERS_BASE_URL}/organizations/${orgSlug}`;

// User registration endpoint for organization
export const ORGANIZATION_REGISTER_URL = (orgSlug) =>
  `${USERS_BASE_URL}/register/${orgSlug}`;

// Password reset endpoints for organization
export const ORGANIZATION_FORGOT_PASSWORD_URL = (orgSlug) =>
  `${USERS_BASE_URL}/forgotPassword/${orgSlug}`;

export const ORGANIZATION_RESET_PASSWORD_URL = (orgSlug) =>
  `${USERS_BASE_URL}/resetPassword/${orgSlug}`;

// Legacy endpoints (kept for backward compatibility if needed)
export const ORGANIZATIONS_BASE_URL = `${normalizeUrl(NEXT_PUBLIC_API_BASE_URL)}/organizations`;
export const ORGANIZATIONS_URL = ORGANIZATIONS_BASE_URL;
