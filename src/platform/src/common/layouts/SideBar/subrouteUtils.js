import { getNavigationItems, USER_TYPES } from './sidebarConfig';

/**
 * Utility functions for extracting subroutes from sidebar configuration
 */

/**
 * Extract subroutes from a navigation item that has dropdown children
 * @param {string} itemLabel - The label of the parent navigation item
 * @param {string} userType - Type of user (USER_TYPES constant)
 * @param {Object} options - Additional options (e.g., orgSlug for organization users)
 * @returns {Array} Array of subroute objects with { label, path, icon? }
 */
export const getSubroutesFromConfig = (
  itemLabel,
  userType = USER_TYPES.USER,
  options = {},
) => {
  const navigationItems = getNavigationItems(userType, options);

  // Find the navigation item that matches the label
  const parentItem = navigationItems.find(
    (item) => item.type === 'dropdown' && item.label === itemLabel,
  );

  if (!parentItem || !parentItem.children) {
    return [];
  }

  // Transform children to subroute format
  return parentItem.children.map((child) => ({
    label: child.label,
    path: child.path,
    icon: child.icon || null,
  }));
};

/**
 * Check if a navigation item has subroutes based on config
 * @param {string} itemLabel - The label of the navigation item
 * @param {string} userType - Type of user
 * @param {Object} options - Additional options
 * @returns {boolean} Whether the item has subroutes
 */
export const hasSubroutesInConfig = (
  itemLabel,
  userType = USER_TYPES.USER,
  options = {},
) => {
  const subroutes = getSubroutesFromConfig(itemLabel, userType, options);
  return subroutes.length > 0;
};

/**
 * Get all navigation items that have subroutes
 * @param {string} userType - Type of user
 * @param {Object} options - Additional options
 * @returns {Array} Array of parent items that have subroutes
 */
export const getParentItemsWithSubroutes = (
  userType = USER_TYPES.USER,
  options = {},
) => {
  const navigationItems = getNavigationItems(userType, options);

  return navigationItems
    .filter(
      (item) =>
        item.type === 'dropdown' && item.children && item.children.length > 0,
    )
    .map((item) => ({
      label: item.label,
      icon: item.icon,
      path: item.path,
      subroutes: item.children.map((child) => ({
        label: child.label,
        path: child.path,
        icon: child.icon || null,
      })),
    }));
};

/**
 * Transform dropdown navigation items to format compatible with enhanced SideBarItem
 * @param {Object} navigationItem - Navigation item from config
 * @returns {Object} Props object for SideBarItem component
 */
export const transformDropdownToSidebarProps = (navigationItem) => {
  if (navigationItem.type !== 'dropdown') {
    return {
      Icon: navigationItem.icon,
      label: navigationItem.label,
      navPath: navigationItem.path,
    };
  }

  return {
    Icon: navigationItem.icon,
    label: navigationItem.label,
    navPath: navigationItem.path || '#',
    subroutes:
      navigationItem.children?.map((child) => ({
        label: child.label,
        path: child.path,
        icon: child.icon || null,
      })) || [],
  };
};

/**
 * Get enhanced sidebar props for all navigation items
 * Automatically detects dropdown items and converts them to subroute format
 * @param {string} userType - Type of user
 * @param {Object} options - Additional options
 * @returns {Array} Array of props objects for SideBarItem components
 */
export const getAllEnhancedSidebarProps = (
  userType = USER_TYPES.USER,
  options = {},
) => {
  const navigationItems = getNavigationItems(userType, options);

  return navigationItems
    .filter((item) => item.type === 'item' || item.type === 'dropdown')
    .map((item) => transformDropdownToSidebarProps(item));
};

export default {
  getSubroutesFromConfig,
  hasSubroutesInConfig,
  getParentItemsWithSubroutes,
  transformDropdownToSidebarProps,
  getAllEnhancedSidebarProps,
};
