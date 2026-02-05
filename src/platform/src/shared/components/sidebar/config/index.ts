import {
  AqHomeSmile,
  AqUser03,
  AqStar06,
  AqGlobe05,
  AqDownload01,
  AqFolderShield,
  AqUsers01,
  AqUserPlus01,
  AqShield02,
  AqSettings01,
  AqData,
  AqKey01,
  AqServer03,
  AqFileQuestion02,
} from '@airqo/icons-react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: string;
  badge?: string | number;
  disabled?: boolean;
  subroutes?: SubRoute[];
}

export interface SubRoute {
  id: string;
  label: string;
  href: string;
  description?: string;
  disabled?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export interface SidebarConfig {
  user: NavGroup[];
  organization: NavGroup[];
  admin: NavGroup[];
  system: NavGroup[];
  global: NavGroup[];
}

// User flow sidebar configuration
const userSidebarConfig: NavGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'home',
        label: 'Home',
        href: '/user/home',
        icon: AqHomeSmile,
      },
      {
        id: 'favorites',
        label: 'My Favorites',
        href: '/user/favorites',
        icon: AqStar06,
      },
      {
        id: 'bulk-export',
        label: 'Visualization & Data Export',
        href: '/user/data-export',
        icon: AqDownload01,
      },
      {
        id: 'map',
        label: 'Map',
        href: '/user/map',
        icon: AqGlobe05,
        disabled: false,
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      {
        id: 'profile',
        label: 'Profile',
        href: '/user/profile',
        icon: AqUser03,
      },
    ],
  },
];

// Organization flow sidebar configuration
const orgSidebarConfig: NavGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/org/dashboard',
        icon: AqHomeSmile,
      },

      {
        id: 'bulk-export',
        label: 'Visualization & Data Export',
        href: '/org/data-export',
        icon: AqDownload01,
      },
      {
        id: 'map',
        label: 'Map',
        href: '/org/map',
        icon: AqGlobe05,
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      {
        id: 'profile',
        label: 'Profile',
        href: '/org/profile',
        icon: AqUser03,
      },
    ],
  },
];

const adminSidebarConfig: NavGroup[] = [
  {
    id: 'admin',
    label: 'Panel',
    items: [
      {
        id: 'admin-clients',
        label: 'API Clients',
        href: '/admin/clients',
        icon: AqKey01,
      },
      {
        id: 'admin-members',
        label: 'Members',
        href: '/admin/members',
        icon: AqUsers01,
      },
      {
        id: 'admin-member-requests',
        label: 'Member Requests',
        href: '/admin/member-requests',
        icon: AqUserPlus01,
      },
      {
        id: 'admin-roles',
        label: 'Roles & Permissions',
        href: '/admin/roles',
        icon: AqShield02,
      },
    ],
  },
  {
    id: 'organization-settings',
    label: 'Organization Settings',
    items: [
      {
        id: 'admin-org-settings',
        label: 'Settings',
        href: '/admin/organization-settings',
        icon: AqSettings01,
      },
    ],
  },
];

const systemSidebarConfig: NavGroup[] = [
  {
    id: 'system',
    label: 'System Management',
    items: [
      {
        id: 'system-org-requests',
        label: 'Organization Requests',
        href: '/system/org-requests',
        icon: AqFileQuestion02,
      },
      {
        id: 'system-user-statistics',
        label: 'User Statistics',
        href: '/system/user-statistics',
        icon: AqServer03,
      },
    ],
  },
];

const globalSidebarConfig: NavGroup[] = [
  {
    id: 'global',
    label: 'Global',
    items: [
      {
        id: 'system-management',
        label: 'System Management',
        href: '/system/org-requests',
        icon: AqServer03,
        subroutes: [
          {
            id: 'system-org-requests',
            label: 'Organization Requests',
            href: '/system/org-requests',
            description: 'Manage organization requests across the platform',
          },
          {
            id: 'system-user-statistics',
            label: 'User Statistics',
            href: '/system/user-statistics',
            description: 'View user statistics across the platform',
          },
        ],
      },
      {
        id: 'admin-panel',
        label: 'Organization Panel',
        href: '/admin/members',
        icon: AqFolderShield,
        subroutes: [
          {
            id: 'admin-clients',
            label: 'API Clients',
            href: '/admin/clients',
            description: 'Manage API clients',
          },
          {
            id: 'admin-members',
            label: 'Members',
            href: '/admin/members',
            description: 'View and manage members',
          },
          {
            id: 'admin-member-requests',
            label: 'Member Requests',
            href: '/admin/member-requests',
            description: 'Review member requests',
          },
          {
            id: 'admin-roles',
            label: 'Roles & Permissions',
            href: '/admin/roles',
            description: 'Manage roles and permissions',
          },
          {
            id: 'admin-org-settings',
            label: 'Organization Settings',
            href: '/admin/organization-settings',
            description: 'Configure organization settings',
          },
        ],
      },
      {
        id: 'data-access',
        label: 'Data Access',
        href: '/data-access',
        icon: AqData,
      },
    ],
  },
];

export const sidebarConfig: SidebarConfig = {
  user: userSidebarConfig,
  organization: orgSidebarConfig,
  admin: adminSidebarConfig,
  system: systemSidebarConfig,
  global: globalSidebarConfig,
};

// Utility functions for sidebar configuration
export const getSidebarConfig = (
  type: 'user' | 'organization' | 'admin' | 'system' | 'global'
): NavGroup[] => {
  return sidebarConfig[type];
};

// Flatten all nav items for a specific type
export const getAllNavItems = (
  type: 'user' | 'organization' | 'admin' | 'system' | 'global'
): NavItem[] => {
  return sidebarConfig[type].flatMap(group => group.items);
};

// Get nav item by href for a specific type
export const getNavItemByHref = (
  href: string,
  type: 'user' | 'organization' | 'admin' | 'system' | 'global'
): NavItem | undefined => {
  const allNavItems = getAllNavItems(type);
  return allNavItems.find(item => item.href === href);
};

// Legacy export for backward compatibility (returns user flow items)
export const allNavItems = getAllNavItems('user');

// Bottom navigation items for user flow (max 3 for mobile)
export const bottomNavItems: Record<'user' | 'organization', NavItem[]> = {
  user: [
    {
      id: 'home',
      label: 'Home',
      href: '/user/home',
      icon: AqHomeSmile,
    },
    {
      id: 'favorites',
      label: 'Favorites',
      href: '/user/favorites',
      icon: AqStar06,
    },

    {
      id: 'bulk-export',
      label: 'Export',
      href: '/user/data-export',
      icon: AqDownload01,
    },
    {
      id: 'map',
      label: 'Map',
      href: '/user/map',
      icon: AqGlobe05,
    },
  ],
  organization: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/org/dashboard', // Will be replaced with slug
      icon: AqHomeSmile,
    },

    {
      id: 'bulk-export',
      label: 'Export',
      href: '/org/data-export', // Will be replaced with slug
      icon: AqDownload01,
    },
    {
      id: 'map',
      label: 'Map',
      href: '/org/map', // Will be replaced with slug
      icon: AqGlobe05,
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/org/profile', // Will be replaced with slug
      icon: AqUser03,
    },
  ],
};
