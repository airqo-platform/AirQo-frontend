// Layout configuration constants for different routes
export const LAYOUT_CONFIGS = {
  // Dashboard routes configuration
  DASHBOARD: {
    // Legacy routes (for backward compatibility)
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
    // New user routes with /user/ prefix
    '/user/Home': {
      pageTitle: 'Home - AirQo Analytics',
      topbarTitle: 'Home',
      noBorderBottom: true,
      showSearch: false,
      noTopNav: false,
    },
    '/user/analytics': {
      pageTitle: 'Analytics - AirQo Analytics',
      topbarTitle: 'Analytics',
      noBorderBottom: false,
      showSearch: true,
      noTopNav: false,
    },
    '/user/settings': {
      pageTitle: 'Settings - AirQo Analytics',
      topbarTitle: 'Settings',
      noBorderBottom: true,
      showSearch: false,
      noTopNav: false,
    },
    '/user/collocation': {
      pageTitle: 'Collocation - AirQo Analytics',
      topbarTitle: 'Collocation',
      noBorderBottom: false,
      showSearch: false,
      noTopNav: false,
    },
    '/user/collocation/overview': {
      pageTitle: 'Collocation Overview - AirQo Analytics',
      topbarTitle: 'Collocation Overview',
      noBorderBottom: false,
      showSearch: false,
      noTopNav: false,
    },
    '/user/collocation/collocate': {
      pageTitle: 'Collocate Devices - AirQo Analytics',
      topbarTitle: 'Collocate Devices',
      noBorderBottom: false,
      showSearch: false,
      noTopNav: false,
    },
  },
  // Auth routes configuration
  AUTH: {
    '/user/login': {
      pageTitle: 'Sign In - AirQo Analytics',
      rightText:
        'Welcome back! Sign in to access your AirQo Analytics dashboard and monitor air quality data.',
      sideBackgroundColor:
        'bg-[var(--org-primary-50,rgba(20,95,255,0.1))] dark:bg-[#252627]',
    },
    '/user/creation': {
      pageTitle: 'Create Account - AirQo Analytics',
      rightText:
        'Join AirQo Analytics to start monitoring and analyzing air quality data in your area.',
      sideBackgroundColor:
        'bg-[var(--org-primary-50,rgba(20,95,255,0.1))] dark:bg-[#252627]',
    },
    '/user/forgotPwd': {
      pageTitle: 'Reset Password - AirQo Analytics',
      rightText:
        'Reset your password to regain access to your AirQo Analytics account.',
      sideBackgroundColor:
        'bg-[var(--org-primary-50,rgba(20,95,255,0.1))] dark:bg-[#252627]',
    },
  }, // Map routes configuration
  MAP: {
    '/user/map': {
      pageTitle: 'Air Quality Map - AirQo Analytics',
      topbarTitle: 'Air Quality Map',
      noBorderBottom: true,
      showSearch: true,
      noTopNav: false,
    },
  },
  // Organization routes configuration
  ORGANIZATION: {
    // Dashboard routes
    '/org/[org_slug]/dashboard': {
      pageTitle: 'Dashboard - Organization Analytics',
      topbarTitle: 'Dashboard',
      noBorderBottom: true,
      showSearch: false,
      noTopNav: false,
    },
    '/org/[org_slug]/insights': {
      pageTitle: 'Insights - Organization Analytics',
      topbarTitle: 'Insights',
      noBorderBottom: false,
      showSearch: true,
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
    sideBackgroundColor:
      'bg-[var(--org-primary-50,rgba(20,95,255,0.1))] dark:bg-[#252627]',
  },
  MAP: {
    pageTitle: 'Map - AirQo Analytics',
    topbarTitle: 'Air Quality Map',
    noBorderBottom: true,
    showSearch: true,
    noTopNav: false,
  },
  ORGANIZATION: {
    pageTitle: 'Organization Analytics',
    topbarTitle: 'Dashboard',
    noBorderBottom: false,
    showSearch: false,
    noTopNav: false,
  },
};
