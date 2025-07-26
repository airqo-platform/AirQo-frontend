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
  // Example step awaiting an action (conceptual)
  // {
  //   target: '.some-button',
  //   title: 'Try It Out',
  //   content: 'Click the button below to see what happens.',
  //   disableBeacon: true,
  //   placement: 'auto',
  //   awaitedAction: { type: 'CUSTOM_EVENT', payload: 'USER_CLICKED_BUTTON' } // Define awaited action
  // },
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
    // Example: This tour could wait for a specific event before starting or resuming
    // awaitedAction: { type: 'CUSTOM_EVENT', payload: 'USER_CLICKED_QUICK_ACTION' }
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
export const globalTourConfig = {
  globalOnboarding: {
    key: 'globalOnboarding',
    steps: globalOnboardingSteps,
    options: {
      continuous: true,
      showSkipButton: true,
      showProgress: true,
      disableOverlayClose: true,
    },
    // Example: This global tour could wait for a specific event
    // awaitedAction: { type: 'CUSTOM_EVENT', payload: 'USER_CHANGED_THEME' }
  },
  // Add other global tours here
};
