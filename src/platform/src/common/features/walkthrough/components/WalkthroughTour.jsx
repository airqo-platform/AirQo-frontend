import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useWalkthroughContext } from './WalkthroughProvider';
import TourStep from './TourStep';
import TourOverlay from './TourOverlay';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';
import { validateSteps } from '../utils/validation';
// import { TOUR_EVENTS } from '../utils/constants';

export default function WalkthroughTour({
  steps = [],
  isActive = false,
  configuration = {},
  onTourStart,
  onStepChange,
  onTourComplete,
  onTourSkip,
  onBeaconClick,
}) {
  const {
    currentStep,
    isActive: contextIsActive,
    startTour,
    endTour,
    nextStep,
    previousStep,
    setError,
  } = useWalkthroughContext();

  const tourIsActive = isActive || contextIsActive;
  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (isActive && steps.length > 0) {
      const validationResult = validateSteps(steps);
      if (!validationResult.isValid) {
        setError(validationResult.errors);
        return;
      }
      startTour(steps, configuration);
      onTourStart?.(steps[0]);
    } else if (!isActive && contextIsActive) {
      endTour();
    }
  }, [
    isActive,
    steps,
    configuration,
    startTour,
    endTour,
    setError,
    onTourStart,
    contextIsActive,
  ]);

  useEffect(() => {
    if (tourIsActive && currentStepData) {
      onStepChange?.(currentStepData, currentStep);
    }
  }, [currentStep, currentStepData, tourIsActive, onStepChange]);

  useEffect(() => {
    if (tourIsActive && currentStep >= steps.length - 1 && steps.length > 0) {
      const timer = setTimeout(() => {
        endTour();
        onTourComplete?.();
      }, configuration.completionDelay || 1000);
      return () => clearTimeout(timer);
    }
  }, [
    currentStep,
    steps.length,
    tourIsActive,
    endTour,
    onTourComplete,
    configuration.completionDelay,
  ]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      nextStep();
    } else {
      endTour();
      onTourComplete?.();
    }
  }, [currentStep, steps.length, nextStep, endTour, onTourComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      previousStep();
    }
  }, [currentStep, previousStep]);

  const handleSkip = useCallback(() => {
    endTour();
    onTourSkip?.(currentStepData);
  }, [endTour, onTourSkip, currentStepData]);

  const handleClose = useCallback(() => {
    endTour();
  }, [endTour]);

  const handleBeaconClick = useCallback(
    (step) => {
      onBeaconClick?.(step);
    },
    [onBeaconClick],
  );

  useKeyboardNavigation({
    isActive: tourIsActive,
    onNext: handleNext,
    onPrevious: handlePrevious,
    onEscape: handleClose,
    configuration,
  });

  if (!tourIsActive || !currentStepData) {
    return null;
  }

  return (
    <>
      <TourOverlay
        isActive={tourIsActive}
        currentStep={currentStepData}
        configuration={configuration}
        onClick={configuration.closeOnOverlayClick ? handleClose : undefined}
      />
      <TourStep
        step={currentStepData}
        stepIndex={currentStep}
        totalSteps={steps.length}
        configuration={configuration}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        onClose={handleClose}
        onBeaconClick={handleBeaconClick}
      />
    </>
  );
}

WalkthroughTour.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      target: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
        .isRequired,
      placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right', 'auto']),
      showBeacon: PropTypes.bool,
      blockInteraction: PropTypes.bool,
      customClass: PropTypes.string,
    }),
  ),
  isActive: PropTypes.bool,
  configuration: PropTypes.object,
  onTourStart: PropTypes.func,
  onStepChange: PropTypes.func,
  onTourComplete: PropTypes.func,
  onTourSkip: PropTypes.func,
  onBeaconClick: PropTypes.func,
};
