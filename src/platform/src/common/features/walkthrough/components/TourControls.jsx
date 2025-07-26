import React from 'react';
import PropTypes from 'prop-types';

export default function TourControls({
  stepIndex,
  totalSteps,
  configuration,
  onNext,
  onPrevious,
  onSkip,
  onClose,
}) {
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;
  const showSkipButton = configuration.showSkipButton !== false;
  const showCloseButton = configuration.showCloseButton !== false;

  return (
    <div className="walkthrough-controls">
      <div className="walkthrough-controls__left">
        {showSkipButton && !isLastStep && (
          <button
            type="button"
            className="walkthrough-controls__button walkthrough-controls__button--skip"
            onClick={onSkip}
            aria-label="Skip tour"
          >
            {configuration.skipButtonText || 'Skip'}
          </button>
        )}
      </div>
      <div className="walkthrough-controls__right">
        {!isFirstStep && (
          <button
            type="button"
            className="walkthrough-controls__button walkthrough-controls__button--previous"
            onClick={onPrevious}
            aria-label="Previous step"
          >
            {configuration.previousButtonText || 'Previous'}
          </button>
        )}
        {!isLastStep ? (
          <button
            type="button"
            className="walkthrough-controls__button walkthrough-controls__button--next walkthrough-controls__button--primary"
            onClick={onNext}
            aria-label="Next step"
          >
            {configuration.nextButtonText || 'Next'}
          </button>
        ) : (
          <button
            type="button"
            className="walkthrough-controls__button walkthrough-controls__button--done walkthrough-controls__button--primary"
            onClick={onNext}
            aria-label="Complete tour"
          >
            {configuration.doneButtonText || 'Done'}
          </button>
        )}
        {showCloseButton && (
          <button
            type="button"
            className="walkthrough-controls__button walkthrough-controls__button--close"
            onClick={onClose}
            aria-label="Close tour"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

TourControls.propTypes = {
  stepIndex: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  configuration: PropTypes.object.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
