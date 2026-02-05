// Page title configuration for dynamic header display
export const PAGE_TITLES: Record<string, string> = {
  // User routes
  '/user/home': 'Home',
  '/user/map': 'Map',
  '/user/profile': 'Profile',
  '/user/favorites': 'Favorites',
  '/user/data-export': 'Data Export',

  // Organization routes (dynamic with slug)
  '/org/dashboard': 'Dashboard',
  '/org/data-export': 'Data Export',
  '/org/favorites': 'Favorites',
  '/org/members': 'Members',
  '/org/profile': 'Profile',
  '/org/role-permissions': 'Roles & Permissions',
  '/org/settings': 'Settings',

  '/request-organization': 'Organization',

  // System routes (platform-wide admin features)
  '/system/org-requests': 'Organization Requests',
  '/system/user-statistics': 'User Statistics',

  // Admin routes (organization-specific admin features)
  '/admin/members': 'Members',
  '/admin/member-requests': 'Member Requests',
  '/admin/roles': 'Roles & Permissions',
  '/admin/organization-settings': 'Organization Settings',
  '/admin/clients': 'API Clients',

  // Default fallback
  '/': 'AirQo',
};

// Function to get page title from pathname
export const getPageTitle = (pathname: string): string => {
  // Handle dynamic org routes
  if (pathname.startsWith('/org/')) {
    const parts = pathname.split('/');
    if (parts.length >= 4) {
      // org/slug/page
      const route = `/org/${parts[3]}`;
      return PAGE_TITLES[route] || 'Organization';
    }
  }

  // Handle user routes
  if (pathname.startsWith('/user/')) {
    const parts = pathname.split('/');
    if (parts.length >= 3) {
      const route = `/user/${parts[2]}`;
      return PAGE_TITLES[route] || 'User';
    }
  }

  // Handle admin routes
  if (pathname.startsWith('/admin/')) {
    const parts = pathname.split('/');
    if (parts.length >= 4 && parts[2] === 'roles') {
      // Handle /admin/roles/[roleID] route
      return 'Role Details';
    }
    if (parts.length >= 3) {
      const route = `/admin/${parts[2]}`;
      return PAGE_TITLES[route] || 'Admin';
    }
  }

  // Handle system routes
  if (pathname.startsWith('/system/')) {
    const parts = pathname.split('/');
    if (parts.length >= 3) {
      const route = `/system/${parts[2]}`;
      return PAGE_TITLES[route] || 'System';
    }
  }

  // Return exact match or default
  return PAGE_TITLES[pathname] || PAGE_TITLES['/'] || 'AirQo';
};

// Function to capitalize title while preserving intentional mixed case
export const capitalizeTitle = (title: string): string => {
  // Special cases for brand names that should preserve mixed case
  const preserveCaseTitles = ['AirQo'];

  if (preserveCaseTitles.includes(title)) {
    return title;
  }

  return title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
