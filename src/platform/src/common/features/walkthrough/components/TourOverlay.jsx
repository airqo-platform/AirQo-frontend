import React from 'react';
import PropTypes from 'prop-types';
import useElementPosition from '../hooks/useElementPosition';

export default function TourOverlay({
  isActive,
  currentStep,
  configuration,
  onClick,
}) {
  const targetElement = document.querySelector(currentStep?.target);
  const position = useElementPosition(targetElement);

  if (!isActive || !position) {
    return null;
  }

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: configuration.overlayColor || 'rgba(0, 0, 0, 0.5)',
    zIndex: 9998,
    pointerEvents: onClick ? 'all' : 'none',
    transition: 'all 0.3s ease',
    ...configuration.customStyles?.overlay,
  };

  const spotlightStyle = {
    position: 'absolute',
    top: position.top - 4,
    left: position.left - 4,
    width: position.width + 8,
    height: position.height + 8,
    borderRadius: configuration.spotlightBorderRadius || '4px',
    boxShadow: `0 0 0 9999px ${configuration.overlayColor || 'rgba(0, 0, 0, 0.5)'}`,
    pointerEvents: 'none',
    transition: 'all 0.3s ease',
  };

  return (
    <div
      className="walkthrough-overlay"
      style={overlayStyle}
      onClick={onClick}
      role="presentation"
    >
      <div className="walkthrough-spotlight" style={spotlightStyle} />
    </div>
  );
}

TourOverlay.propTypes = {
  isActive: PropTypes.bool.isRequired,
  currentStep: PropTypes.object,
  configuration: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};
