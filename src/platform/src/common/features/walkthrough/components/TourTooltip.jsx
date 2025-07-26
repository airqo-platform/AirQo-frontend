import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import TourControls from './TourControls';
import TourProgress from './TourProgress';
import { getAriaAttributes } from '../utils/accessibility';

const TourTooltip = forwardRef(
  (
    {
      step,
      stepIndex,
      totalSteps,
      position,
      isVisible,
      configuration,
      onNext,
      onPrevious,
      onSkip,
      onClose,
    },
    ref,
  ) => {
    const ariaAttributes = getAriaAttributes(step, stepIndex, totalSteps);
    const tooltipStyle = {
      position: 'absolute',
      top: position.top,
      left: position.left,
      transform: position.transform,
      zIndex: 10000,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      maxWidth: configuration.maxWidth || '320px',
      ...configuration.customStyles?.tooltip,
    };
    const tooltipClasses = [
      'walkthrough-tooltip',
      `walkthrough-tooltip--${position.placement}`,
      configuration.theme && `walkthrough-tooltip--${configuration.theme}`,
      step.customClass,
      isVisible && 'walkthrough-tooltip--visible',
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div
        ref={ref}
        className={tooltipClasses}
        style={tooltipStyle}
        {...ariaAttributes}
      >
        <div
          className={`walkthrough-tooltip__arrow walkthrough-tooltip__arrow--${position.placement}`}
        />
        <div className="walkthrough-tooltip__header">
          <h3 className="walkthrough-tooltip__title">{step.title}</h3>
          {configuration.showProgress !== false && (
            <TourProgress
              currentStep={stepIndex}
              totalSteps={totalSteps}
              configuration={configuration}
            />
          )}
        </div>
        <div className="walkthrough-tooltip__content">
          {typeof step.content === 'string' ? (
            <p dangerouslySetInnerHTML={{ __html: step.content }} />
          ) : (
            step.content
          )}
        </div>
        <TourControls
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          configuration={configuration}
          onNext={onNext}
          onPrevious={onPrevious}
          onSkip={onSkip}
          onClose={onClose}
        />
      </div>
    );
  },
);

TourTooltip.displayName = 'TourTooltip';

TourTooltip.propTypes = {
  step: PropTypes.object.isRequired,
  stepIndex: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  position: PropTypes.object.isRequired,
  isVisible: PropTypes.bool.isRequired,
  configuration: PropTypes.object.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TourTooltip;
