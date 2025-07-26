import React from 'react';
import PropTypes from 'prop-types';

export default function TourBeacon({
  position,
  isVisible,
  onClick,
  configuration,
  customClass,
}) {
  const beaconStyle = {
    position: 'absolute',
    top: position.top + position.height / 2,
    left: position.left + position.width / 2,
    transform: 'translate(-50%, -50%)',
    zIndex: 10001,
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'all',
    ...configuration.customStyles?.beacon,
  };
  const beaconClasses = [
    'walkthrough-beacon',
    configuration.theme && `walkthrough-beacon--${configuration.theme}`,
    customClass,
    isVisible && 'walkthrough-beacon--visible',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type="button"
      className={beaconClasses}
      style={beaconStyle}
      onClick={onClick}
      aria-label="Show tour step"
    >
      <div className="walkthrough-beacon__inner" />
      <div className="walkthrough-beacon__pulse" />
    </button>
  );
}

TourBeacon.propTypes = {
  position: PropTypes.object.isRequired,
  isVisible: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
  configuration: PropTypes.object.isRequired,
  customClass: PropTypes.string,
};
