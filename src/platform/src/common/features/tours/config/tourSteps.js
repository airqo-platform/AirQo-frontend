// --- Home Page (/user/Home) ---
export const homePageSteps = [
  {
    target: '.home-quick-actions',
    title: 'Quick Actions',
    content: 'Perform common tasks quickly from here.',
    disableBeacon: true,
    placement: 'auto',
  },
];

// --- Analytics Page (/user/analytics) ---
export const analyticsPageSteps = [
  {
    target: '.analytics-cards-container-1',
    title: 'Analytics Overview',
    content:
      'You can click on any card to view detailed analytics for that location and more.',
    disableBeacon: true,
    placement: 'auto',
  },
];

// --- Global Tour Steps ---
export const globalOnboardingSteps = [
  {
    target: 'body',
    title: 'Welcome to Our App!',
    content: 'Let us give you a quick tour of the main features.',
    disableBeacon: true,
    placement: 'center',
  },
  {
    target: '.topBarOrganizationSelector',
    title: 'Getting Started',
    content: 'Here are some tips to help you get started with our app.',
    disableBeacon: true,
    placement: 'auto',
  },
  {
    target: '.topBarAppDropdown',
    title: 'App Navigation',
    content: 'Switch between different applications using this dropdown.',
    disableBeacon: true,
    placement: 'auto',
  },
  {
    target: '.theme-customizer-sideButton',
    title: 'Theme Customization',
    content: 'Customize the look and feel of the app from here.',
    disableBeacon: true,
    placement: 'auto',
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
