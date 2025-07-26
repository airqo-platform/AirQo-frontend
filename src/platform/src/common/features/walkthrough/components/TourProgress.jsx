import React from 'react';
import PropTypes from 'prop-types';

export default function TourProgress({
  currentStep,
  totalSteps,
  configuration,
}) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  if (configuration.progressType === 'dots') {
    return (
      <div className="walkthrough-progress walkthrough-progress--dots">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`walkthrough-progress__dot ${
              index <= currentStep ? 'walkthrough-progress__dot--active' : ''
            }`}
          />
        ))}
      </div>
    );
  }
  if (configuration.progressType === 'numbers') {
    return (
      <div className="walkthrough-progress walkthrough-progress--numbers">
        <span className="walkthrough-progress__current">{currentStep + 1}</span>
        <span className="walkthrough-progress__separator"> / </span>
        <span className="walkthrough-progress__total">{totalSteps}</span>
      </div>
    );
  }
  return (
    <div className="walkthrough-progress walkthrough-progress--bar">
      <div className="walkthrough-progress__track">
        <div
          className="walkthrough-progress__fill"
          style={{
            width: `${progressPercentage}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <span className="walkthrough-progress__text">
        {currentStep + 1} of {totalSteps}
      </span>
    </div>
  );
}

TourProgress.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  configuration: PropTypes.object.isRequired,
};
