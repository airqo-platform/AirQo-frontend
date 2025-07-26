import PropTypes from 'prop-types';

export const StepPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  target: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right', 'auto']),
  showBeacon: PropTypes.bool,
  blockInteraction: PropTypes.bool,
  customClass: PropTypes.string,
  data: PropTypes.object,
});

export const ConfigurationPropType = PropTypes.shape({
  theme: PropTypes.string,
  showProgress: PropTypes.bool,
  showSkipButton: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  keyboardNavigation: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  disableInteraction: PropTypes.bool,
  scrollBehavior: PropTypes.oneOf(['auto', 'smooth']),
  scrollOffset: PropTypes.number,
  spacing: PropTypes.number,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  completionDelay: PropTypes.number,
  overlayColor: PropTypes.string,
  spotlightBorderRadius: PropTypes.string,
  progressType: PropTypes.oneOf(['bar', 'dots', 'numbers']),
  nextButtonText: PropTypes.string,
  previousButtonText: PropTypes.string,
  skipButtonText: PropTypes.string,
  doneButtonText: PropTypes.string,
  customStyles: PropTypes.shape({
    tooltip: PropTypes.object,
    overlay: PropTypes.object,
    beacon: PropTypes.object,
    controls: PropTypes.object,
    progress: PropTypes.object,
  }),
  responsive: PropTypes.shape({
    mobile: PropTypes.object,
    tablet: PropTypes.object,
    desktop: PropTypes.object,
  }),
});

export const PositionPropType = PropTypes.shape({
  top: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  right: PropTypes.number,
  bottom: PropTypes.number,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  centerX: PropTypes.number,
  centerY: PropTypes.number,
});

export const EventHandlersPropType = PropTypes.shape({
  onTourStart: PropTypes.func,
  onStepChange: PropTypes.func,
  onTourComplete: PropTypes.func,
  onTourSkip: PropTypes.func,
  onBeaconClick: PropTypes.func,
  onClose: PropTypes.func,
});
