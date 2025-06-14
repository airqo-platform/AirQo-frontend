import HomeIcon from '@/icons/SideBar/HomeIcon';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import CollocateIcon from '@/icons/SideBar/CollocateIcon';
import WorldIcon from '@/icons/SideBar/world_Icon';
import { checkAccess } from '@/core/HOC/authUtils';

/**
 * Navigation configuration for authenticated users
 * This provides a centralized configuration for sidebar navigation items
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
 * Get navigation items for mobile drawer
 * Similar to getUserNavigationItems but optimized for mobile view
 */
export const getMobileNavigationItems = () => {
  return getUserNavigationItems(); // For now, same as desktop
};

/**
 * Check if current route should force sidebar items to be icon-only
 * Map route should always show only icons even when not collapsed
 */
export const shouldForceIconOnly = (pathname) => {
  const iconOnlyRoutes = ['/user/map'];
  return iconOnlyRoutes.includes(pathname);
};
