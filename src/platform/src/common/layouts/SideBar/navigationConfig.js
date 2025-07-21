import {
  getUserNavigationItems as getUnifiedUserNav,
  getMobileNavigationItems as getUnifiedMobileNav,
  shouldForceIconOnly as unifiedShouldForceIconOnly,
} from './sidebarConfig';

/**
 * Legacy navigation configuration for backward compatibility
 * This file is maintained for components that haven't been migrated yet
 * New components should use sidebarConfig.js directly
 */

/**
 * Navigation configuration for authenticated users
 * This provides a centralized configuration for sidebar navigation items
 * @deprecated Use getNavigationItems from sidebarConfig.js instead
 */
export const getUserNavigationItems = () => {
  return getUnifiedUserNav();
};

/**
 * Get navigation items for mobile drawer
 * Similar to getUserNavigationItems but optimized for mobile view
 * @deprecated Use getMobileNavigationItems from sidebarConfig.js instead
 */
export const getMobileNavigationItems = () => {
  return getUnifiedMobileNav('user');
};

/**
 * Check if current route should force sidebar items to be icon-only
 * Map route should always show only icons even when not collapsed
 * @deprecated Use shouldForceIconOnly from sidebarConfig.js instead
 */
export const shouldForceIconOnly = (pathname) => {
  return unifiedShouldForceIconOnly(pathname);
};
