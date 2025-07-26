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
    title: (
      <div className="text-2xl font-bold text-primary">
        Welcome to AirQo Analytics
      </div>
    ),
    content: (
      <div className="mt-3 space-y-3">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Access comprehensive air quality monitoring and analytics to make
          data-driven environmental decisions.
        </p>
        <p className="text-base text-gray-600 dark:text-gray-400">
          This quick tour will introduce you to the platform&apos;s key features
          and help you get started with your air quality analysis.
        </p>
      </div>
    ),
    disableBeacon: true,
    placement: 'center',
  },
  {
    target: '.topBarOrganizationSelector',
    title: (
      <div className="text-xl font-semibold text-primary">
        Organization Dashboard
      </div>
    ),
    content: (
      <div className="mt-2 text-base text-gray-700 dark:text-gray-300">
        <p>
          Select your organization to access customized air quality data,
          monitoring networks, and organizational insights.
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Each organization has its own data scope and user permissions.
        </p>
      </div>
    ),
    disableBeacon: true,
    placement: 'auto',
  },
  {
    target: '.topBarAppDropdown',
    title: (
      <div className="text-xl font-semibold text-primary">AirQo Ecosystem</div>
    ),
    content: (
      <div className="mt-2 text-base text-gray-700 dark:text-gray-300">
        <p>
          Access AirQo&apos;s complete suite of applications:
          <span className="font-medium"> Calibrate</span>,
          <span className="font-medium"> Analytics</span>,
          <span className="font-medium"> Website</span>,
          <span className="font-medium"> API Docs</span>, and
          <span className="font-medium"> Mobile App</span>.
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Seamlessly switch between different AirQo tools and services.
        </p>
      </div>
    ),
    disableBeacon: true,
    placement: 'auto',
  },
  {
    target: '.theme-customizer-sideButton',
    title: (
      <div className="text-xl font-semibold text-primary">
        Interface Preferences
      </div>
    ),
    content: (
      <div className="mt-2 text-base text-gray-700 dark:text-gray-300">
        <p>
          Customize your workspace with theme options and layout preferences
          optimized for extended data analysis sessions.
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Choose between light and dark modes, adjust sidebar settings, and
          more.
        </p>
      </div>
    ),
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
