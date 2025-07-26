// // --- Analytics Page (/user/analytics) ---
// export const analyticsPageSteps = [
//   {
//     target: '.show-view-more-data-button',
//     title: 'View More Data',
//     content: 'Click this button to see more detailed analytics.',
//     disableBeacon: true,
//     placement: 'auto',
//     awaitedAction: { type: 'CUSTOM_EVENT', payload: 'USER_CLICKED_BUTTON' },
//   },
// ];

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

// --- Standalone Info Popup (Not a tour step) ---
// export const standaloneInfoPopup = {
//   target: '.view-more-data-button',
//   title: 'View More Data',
//   content: 'Click this button to view more detailed data insights.',
//   disableBeacon: true,
//   placement: 'auto',
//   isStandalone: true,
// };

// --- Route-Based Tour Configurations ---
export const routeTourConfig = {
  // '/user/analytics': {
  //   key: 'analyticsTour',
  //   steps: analyticsPageSteps,
  //   options: {
  //     continuous: true,
  //     showSkipButton: true,
  //     showProgress: true,
  //     disableOverlayClose: true,
  //   },
  // },
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
  },
  // Add other global tours here
};

// --- Standalone Popups Configurations ---
// Keyed by a unique identifier for the popup
// export const standalonePopupConfig = {
//   viewMoreDataButton: {
//     key: 'viewMoreDataButton',
//     step: standaloneInfoPopup,
//     options: {
//       continuous: false,
//       showSkipButton: false,
//       showProgress: false,
//       disableOverlayClose: true,
//     },
//   },
//   // Add other standalone popups here
//   // 'anotherInfoPopup': { ... }
// };
