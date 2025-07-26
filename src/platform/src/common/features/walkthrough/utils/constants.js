export const TOUR_ACTIONS = {
  START_TOUR: 'START_TOUR',
  END_TOUR: 'END_TOUR',
  NEXT_STEP: 'NEXT_STEP',
  PREVIOUS_STEP: 'PREVIOUS_STEP',
  GO_TO_STEP: 'GO_TO_STEP',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
};

export const TOUR_EVENTS = {
  TOUR_START: 'tourStart',
  TOUR_END: 'tourEnd',
  STEP_CHANGE: 'stepChange',
  BEACON_CLICK: 'beaconClick',
};

export const PLACEMENT_OPTIONS = ['top', 'bottom', 'left', 'right', 'auto'];

export const DEFAULT_CONFIGURATION = {
  theme: 'default',
  showProgress: true,
  showSkipButton: true,
  showCloseButton: true,
  keyboardNavigation: true,
  closeOnOverlayClick: false,
  disableInteraction: false,
  scrollBehavior: 'smooth',
  scrollOffset: 20,
  spacing: 12,
  maxWidth: '320px',
  completionDelay: 1000,
  overlayColor: 'rgba(0, 0, 0, 0.5)',
  spotlightBorderRadius: '4px',
  progressType: 'bar',
  nextButtonText: 'Next',
  previousButtonText: 'Previous',
  skipButtonText: 'Skip',
  doneButtonText: 'Done',
  responsive: {
    mobile: {
      maxWidth: '280px',
      spacing: 8,
    },
    tablet: {
      maxWidth: '300px',
      spacing: 10,
    },
    desktop: {
      maxWidth: '320px',
      spacing: 12,
    },
  },
};

export const CSS_CLASSES = {
  WALKTHROUGH_PORTAL: 'walkthrough-portal',
  WALKTHROUGH_OVERLAY: 'walkthrough-overlay',
  WALKTHROUGH_SPOTLIGHT: 'walkthrough-spotlight',
  WALKTHROUGH_TOOLTIP: 'walkthrough-tooltip',
  WALKTHROUGH_BEACON: 'walkthrough-beacon',
  TOOLTIP_ARROW: 'walkthrough-tooltip__arrow',
  TOOLTIP_HEADER: 'walkthrough-tooltip__header',
  TOOLTIP_TITLE: 'walkthrough-tooltip__title',
  TOOLTIP_CONTENT: 'walkthrough-tooltip__content',
  CONTROLS: 'walkthrough-controls',
  CONTROLS_LEFT: 'walkthrough-controls__left',
  CONTROLS_RIGHT: 'walkthrough-controls__right',
  CONTROLS_BUTTON: 'walkthrough-controls__button',
  PROGRESS: 'walkthrough-progress',
  PROGRESS_BAR: 'walkthrough-progress--bar',
  PROGRESS_DOTS: 'walkthrough-progress--dots',
  PROGRESS_NUMBERS: 'walkthrough-progress--numbers',
  VISIBLE: 'walkthrough-tooltip--visible',
  ACTIVE: 'walkthrough-beacon--active',
  PRIMARY: 'walkthrough-controls__button--primary',
};

export const Z_INDEX = {
  OVERLAY: 9998,
  SPOTLIGHT: 9999,
  TOOLTIP: 10000,
  BEACON: 10001,
};
