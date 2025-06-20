import HomeIcon from '@/icons/SideBar/HomeIcon';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import CollocateIcon from '@/icons/SideBar/CollocateIcon';
import WorldIcon from '@/icons/SideBar/world_Icon';
import UsersIcon from '@/icons/SideBar/UsersIcon';
import PersonIcon from '@/icons/Settings/PersonIcon';
import {
  MdBusiness,
  MdSecurity,
  MdDescription,
  MdDashboard,
} from 'react-icons/md';
import { checkAccess } from '@/core/HOC/authUtils';

/**
 * Centralized sidebar configuration for all user types
 * This eliminates code duplication and provides a single source of truth for navigation
 */

/**
 * User type constants
 */
export const USER_TYPES = {
  USER: 'user',
  ADMIN: 'admin',
  ORGANIZATION: 'organization',
};

/**
 * Base navigation item structure
 * @typedef {Object} NavigationItem
 * @property {string} type - Type of item: 'item', 'divider', 'dropdown'
 * @property {string} label - Display label
 * @property {React.Component} icon - Icon component
 * @property {string} path - Navigation path (for items)
 * @property {boolean} dropdown - Whether item has dropdown (for dropdown type)
 * @property {Array} children - Child items (for dropdown type)
 * @property {string|Function} permission - Permission required to view item
 * @property {boolean} forceIconOnly - Force icon-only display for this item
 */

/**
 * Generate navigation items for regular users
 */
export const getUserNavigationItems = () => {
  const items = [
    {
      type: 'item',
      label: 'Home',
      icon: HomeIcon,
      path: '/user/Home',
    },
    {
      type: 'item',
      label: 'Analytics',
      icon: BarChartIcon,
      path: '/user/analytics',
    },
    {
      type: 'divider',
      label: 'Network',
    },
  ];

  // Add collocation section if user has access
  if (checkAccess('CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES')) {
    items.push({
      type: 'dropdown',
      label: 'Collocation',
      icon: CollocateIcon,
      dropdown: true,
      children: [
        {
          label: 'Overview',
          path: '/user/collocation/overview',
        },
        {
          label: 'Collocate',
          path: '/user/collocation/collocate',
        },
      ],
    });
  }

  // Add remaining navigation items
  items.push(
    {
      type: 'item',
      label: 'Map',
      icon: WorldIcon,
      path: '/user/map',
    },
    {
      type: 'item',
      label: 'Settings',
      icon: SettingsIcon,
      path: '/user/settings',
    },
  );

  return items;
};

/**
 * Generate navigation items for admin users
 */
export const getAdminNavigationItems = () => {
  return [
    {
      type: 'item',
      label: 'Dashboard',
      icon: MdDashboard,
      path: '/admin',
    },
    {
      type: 'divider',
      label: 'Management',
    },
    {
      type: 'item',
      label: 'Organizations',
      icon: MdBusiness,
      path: '/admin/organizations/requests',
    },
    {
      type: 'item',
      label: 'Users',
      icon: UsersIcon,
      path: '/admin/users',
    },
    {
      type: 'divider',
      label: 'Analytics',
    },
    {
      type: 'item',
      label: 'Analytics',
      icon: BarChartIcon,
      path: '/admin/analytics',
    },
    {
      type: 'item',
      label: 'Activity Logs',
      icon: MdDescription,
      path: '/admin/activity-logs',
    },
    {
      type: 'divider',
      label: 'System',
    },
    {
      type: 'item',
      label: 'Roles & Permissions',
      icon: MdSecurity,
      path: '/admin/roles',
    },
    {
      type: 'item',
      label: 'Settings',
      icon: SettingsIcon,
      path: '/admin/settings',
    },
  ];
};

/**
 * Generate navigation items for organization users
 * @param {string} orgSlug - Organization slug for dynamic paths
 */
export const getOrganizationNavigationItems = (orgSlug = '') => {
  return [
    {
      type: 'item',
      label: 'Dashboard',
      icon: HomeIcon,
      path: `/org/${orgSlug}/dashboard`,
    },
    {
      type: 'item',
      label: 'Data Insights',
      icon: BarChartIcon,
      path: `/org/${orgSlug}/insights`,
    },
    {
      type: 'divider',
      label: 'Account',
    },
    {
      type: 'item',
      label: 'My Profile',
      icon: PersonIcon,
      path: `/org/${orgSlug}/profile`,
    },
    {
      type: 'divider',
      label: 'Management',
    },
    {
      type: 'item',
      label: 'Members',
      icon: UsersIcon,
      path: `/org/${orgSlug}/members`,
    },
    {
      type: 'item',
      label: 'Settings',
      icon: SettingsIcon,
      path: `/org/${orgSlug}/settings`,
    },
  ];
};

/**
 * Get navigation items based on user type
 * @param {string} userType - Type of user (USER_TYPES constant)
 * @param {Object} options - Additional options (e.g., orgSlug for organization users)
 */
export const getNavigationItems = (userType, options = {}) => {
  switch (userType) {
    case USER_TYPES.ADMIN:
      return getAdminNavigationItems();
    case USER_TYPES.ORGANIZATION:
      return getOrganizationNavigationItems(options.orgSlug);
    case USER_TYPES.USER:
    default:
      return getUserNavigationItems();
  }
};

/**
 * Get navigation items for mobile drawer (can be customized per user type if needed)
 * @param {string} userType - Type of user
 * @param {Object} options - Additional options
 */
export const getMobileNavigationItems = (userType, options = {}) => {
  // For now, same as desktop navigation
  return getNavigationItems(userType, options);
};

/**
 * Routes that should force sidebar items to be icon-only
 */
export const ICON_ONLY_ROUTES = ['/user/map'];

/**
 * Check if current route should force sidebar items to be icon-only
 * @param {string} pathname - Current pathname
 */
export const shouldForceIconOnly = (pathname) => {
  return ICON_ONLY_ROUTES.includes(pathname);
};

/**
 * Get user type from pathname
 * @param {string} pathname - Current pathname
 */
export const getUserTypeFromPath = (pathname) => {
  if (pathname.startsWith('/admin')) {
    return USER_TYPES.ADMIN;
  }
  if (pathname.startsWith('/org/')) {
    return USER_TYPES.ORGANIZATION;
  }
  return USER_TYPES.USER;
};

/**
 * Extract organization slug from pathname
 * @param {string} pathname - Current pathname
 */
export const getOrgSlugFromPath = (pathname) => {
  const match = pathname.match(/^\/org\/([^/]+)/);
  return match ? match[1] : '';
};

/**
 * Theme-based styling configuration
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 */
export const getSidebarStyles = (isDarkMode = false) => ({
  collapseButton: isDarkMode
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200 text-gray-800',
  background: isDarkMode ? 'bg-[#1d1f20]' : 'bg-white',
  border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  scrollbar: isDarkMode
    ? 'scrollbar-thumb-gray-600 scrollbar-track-gray-800'
    : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100',
  divider: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  text: isDarkMode ? 'text-white' : 'text-gray-800',
  mutedText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
  iconFill: isDarkMode ? 'ffffff' : undefined,
  stroke: isDarkMode ? 'white' : '#1f2937',
});
