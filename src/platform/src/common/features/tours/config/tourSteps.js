// --- Dummy Steps for Home Page (/user/Home) ---
export const homePageSteps = [
  {
    target: '.home-welcome-banner',
    title: 'Welcome!',
    content: 'This is your personalized dashboard overview.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '.home-quick-actions',
    title: 'Quick Actions',
    content: 'Perform common tasks quickly from here.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '.home-recent-data',
    title: 'Recent Data',
    content: 'Check the latest updates and information.',
    disableBeacon: true,
    placement: 'top',
  },
];

// --- Dummy Steps for Analytics Page (/user/analytics) ---
export const analyticsPageSteps = [
  {
    target: '.analytics-filters',
    title: 'Filter Your Data',
    content: 'Use these controls to refine the data displayed.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '.analytics-main-chart',
    title: 'Data Visualization',
    content: 'Your data is presented in this main chart area.',
    disableBeacon: true,
    placement: 'top',
  },
  {
    target: '.analytics-export-button',
    title: 'Export Reports',
    content: 'Download your analytics data in various formats.',
    disableBeacon: true,
    placement: 'left',
  },
];

// --- Global Tour Steps ---
export const globalOnboardingSteps = [
  {
    target: 'body', // Start on the whole body
    title: 'Welcome to Our App!',
    content: 'Let us give you a quick tour of the main features.',
    disableBeacon: true,
    placement: 'center', // Use Joyride's 'center' placement if available, or style manually
  },
  {
    target: '.main-navigation',
    title: 'Navigation',
    content: 'Find your way around using this main menu.',
    disableBeacon: true,
    placement: 'right',
  },
  {
    target: '.user-profile-button',
    title: 'Your Profile',
    content: 'Access your profile and settings here.',
    disableBeacon: true,
    placement: 'bottom-end', // Example of specific placement
  },
];

// --- Route-Based Tour Configurations ---
export const routeTourConfig = {
  '/user/Home': {
    key: 'homeTour',
    steps: homePageSteps,
    options: {
      continuous: true,
      showSkipButton: true,
      showProgress: true,
      disableOverlayClose: true,
    },
  },
  '/user/analytics': {
    key: 'analyticsTour',
    steps: analyticsPageSteps,
    options: {
      continuous: true,
      showSkipButton: true,
      showProgress: true,
      disableOverlayClose: true,
    },
  },
  // Add configurations for other paths here
};

// --- Global Tour Configurations ---
// Keyed by a unique identifier for the global tour
export const globalTourConfig = {
  globalOnboarding: {
    key: 'globalOnboarding',
    steps: globalOnboardingSteps,
    options: {
      continuous: true,
      showSkipButton: true,
      showProgress: true,
      disableOverlayClose: true,
      // You might want different defaults for global tours
      // spotlightClicks: true, // Example
    },
  },
};
