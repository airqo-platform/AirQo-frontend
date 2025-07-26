// src/features/tours/config/tourSteps.js

// --- Dummy Steps for Home Page (/user/Home) ---
export const homePageSteps = [
  {
    target: '.home-welcome-banner',
    title: 'Welcome!',
    content: 'This is your personalized dashboard overview.',
    disableBeacon: true,
    placement: 'bottom', // Suggestion
  },
  {
    target: '.home-quick-actions',
    title: 'Quick Actions',
    content: 'Perform common tasks quickly from here.',
    disableBeacon: true,
    placement: 'bottom', // Suggestion
  },
  {
    target: '.home-recent-data',
    title: 'Recent Data',
    content: 'Check the latest updates and information.',
    disableBeacon: true,
    placement: 'top', // Suggestion
  },
];

// --- Dummy Steps for Analytics Page (/user/analytics) ---
export const analyticsPageSteps = [
  {
    target: '.analytics-filters',
    title: 'Filter Your Data',
    content: 'Use these controls to refine the data displayed.',
    disableBeacon: true,
    placement: 'bottom', // Suggestion
  },
  {
    target: '.analytics-main-chart',
    title: 'Data Visualization',
    content: 'Your data is presented in this main chart area.',
    disableBeacon: true,
    placement: 'top', // Suggestion
  },
  {
    target: '.analytics-export-button',
    title: 'Export Reports',
    content: 'Download your analytics data in various formats.',
    disableBeacon: true,
    placement: 'left', // Suggestion
  },
];

// --- Map Paths to Steps ---
export const tourConfig = {
  '/user/Home': {
    key: 'homeTour',
    steps: homePageSteps,
    options: {
      continuous: true,
      showSkipButton: true,
      showProgress: true,
      disableOverlayClose: true, // Ensure it's true here too
      // floaterProps for auto-placement can be added here if needed per tour
      // floaterProps: { disableAnimation: true }
    },
  },
  '/user/analytics': {
    key: 'analyticsTour',
    steps: analyticsPageSteps,
    options: {
      continuous: true,
      showSkipButton: true,
      showProgress: true,
      disableOverlayClose: true, // Ensure it's true here too
      // floaterProps: { disableAnimation: true }
    },
  },
  // Add configurations for other paths here
};
