// Layout configuration constants for different routes
export const LAYOUT_CONFIGS = {
  // Dashboard routes configuration
  DASHBOARD: {
    '/Home': {
      pageTitle: 'Home - AirQo Analytics',
      topbarTitle: 'Home',
      noBorderBottom: true,
      showSearch: false,
      noTopNav: false,
    },
    '/analytics': {
      pageTitle: 'Analytics - AirQo Analytics',
      topbarTitle: 'Analytics',
      noBorderBottom: false,
      showSearch: true,
      noTopNav: false,
    },
    '/settings': {
      pageTitle: 'Settings - AirQo Analytics',
      topbarTitle: 'Settings',
      noBorderBottom: true,
      showSearch: false,
      noTopNav: false,
    },
    '/collocation': {
      pageTitle: 'Collocation - AirQo Analytics',
      topbarTitle: 'Collocation',
      noBorderBottom: false,
      showSearch: false,
      noTopNav: false,
    },
    '/collocation/overview': {
      pageTitle: 'Collocation Overview - AirQo Analytics',
      topbarTitle: 'Collocation Overview',
      noBorderBottom: false,
      showSearch: false,
      noTopNav: false,
    },
    '/collocation/collocate': {
      pageTitle: 'Collocate Devices - AirQo Analytics',
      topbarTitle: 'Collocate Devices',
      noBorderBottom: false,
      showSearch: false,
      noTopNav: false,
    },
  },

  // Auth routes configuration
  AUTH: {
    '/account/login': {
      pageTitle: 'Sign In - AirQo Analytics',
      rightText:
        'Welcome back! Sign in to access your AirQo Analytics dashboard and monitor air quality data.',
      sideBackgroundColor: 'bg-blue-50 dark:bg-[#252627]',
    },
    '/account/creation': {
      pageTitle: 'Create Account - AirQo Analytics',
      rightText:
        'Join AirQo Analytics to start monitoring and analyzing air quality data in your area.',
      sideBackgroundColor: 'bg-green-50 dark:bg-[#252627]',
    },
    '/account/forgotPwd': {
      pageTitle: 'Reset Password - AirQo Analytics',
      rightText:
        'Reset your password to regain access to your AirQo Analytics account.',
      sideBackgroundColor: 'bg-orange-50 dark:bg-[#252627]',
    },
  },

  // Map routes configuration
  MAP: {
    '/map': {
      pageTitle: 'Air Quality Map - AirQo Analytics',
      topbarTitle: 'Air Quality Map',
      noBorderBottom: true,
      showSearch: true,
      noTopNav: false,
    },
  },

  // Admin routes configuration
  ADMIN: {
    '/admin/organisations/pending': {
      pageTitle: 'Pending Organisation Requests - AirQo Analytics',
      topbarTitle: 'Pending Organisation Requests',
      noBorderBottom: false,
      showSearch: true,
      noTopNav: false,
    },
    '/admin/organisations/approved': {
      pageTitle: 'Approved Organisation Requests - AirQo Analytics',
      topbarTitle: 'Approved Organisation Requests',
      noBorderBottom: false,
      showSearch: false,
      noTopNav: false,
    },
  },
};

// Default configurations for fallback
export const DEFAULT_CONFIGS = {
  DASHBOARD: {
    pageTitle: 'AirQo Analytics',
    topbarTitle: 'Dashboard',
    noBorderBottom: false,
    showSearch: false,
    noTopNav: false,
  },
  AUTH: {
    pageTitle: 'AirQo Analytics',
    rightText:
      'Access your AirQo Analytics account to monitor air quality data.',
    sideBackgroundColor: 'bg-blue-50 dark:bg-[#252627]',
  },
  MAP: {
    pageTitle: 'Map - AirQo Analytics',
    topbarTitle: 'Air Quality Map',
    noBorderBottom: true,
    showSearch: true,
    noTopNav: false,
  },
  ADMIN: {
    pageTitle: 'Admin - AirQo Analytics',
    topbarTitle: 'Admin',
    noBorderBottom: false,
    showSearch: false,
    noTopNav: false,
  },
};
