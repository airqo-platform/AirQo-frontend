import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import TourTooltip from './TourTooltip';
import TourBeacon from './TourBeacon';
import ResponsivePortal from './ResponsivePortal';
import useElementPosition from '../hooks/useElementPosition';
import useScrollIntoView from '../hooks/useScrollIntoView';
import useResponsivePosition from '../hooks/useResponsivePosition';
import { PLACEMENT_OPTIONS } from '../utils/constants';

export default function TourStep({
  step,
  stepIndex,
  totalSteps,
  configuration,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  onBeaconClick,
}) {
  const tooltipRef = useRef(null);
  const [targetElement, setTargetElement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = document.querySelector(step.target);
    setTargetElement(element);
    if (!element) {
      console.warn(`Walkthrough: Target element "${step.target}" not found`);
    }
  }, [step.target]);

  const position = useElementPosition(targetElement);
  const responsivePosition = useResponsivePosition({
    targetPosition: position,
    placement: step.placement || 'auto',
    tooltipRef,
    configuration,
  });

  useScrollIntoView(targetElement, {
    isActive: Boolean(targetElement),
    behavior: configuration.scrollBehavior || 'smooth',
    offset: configuration.scrollOffset || 20,
  });

  useEffect(() => {
    if (targetElement && position) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [targetElement, position]);

  const handleBeaconClick = () => {
    onBeaconClick?.(step);
  };

  if (!targetElement || !position) {
    return null;
  }

  return (
    <ResponsivePortal>
      {step.showBeacon !== false && (
        <TourBeacon
          position={position}
          isVisible={isVisible}
          onClick={handleBeaconClick}
          configuration={configuration}
          customClass={step.customClass}
        />
      )}
      <TourTooltip
        ref={tooltipRef}
        step={step}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        position={responsivePosition}
        isVisible={isVisible}
        configuration={configuration}
        onNext={onNext}
        onPrevious={onPrevious}
        onSkip={onSkip}
        onClose={onClose}
      />
      {step.blockInteraction && (
        <div
          className="walkthrough-interaction-blocker"
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            width: position.width,
            height: position.height,
            zIndex: 9999,
            pointerEvents: 'all',
            backgroundColor: 'transparent',
          }}
        />
      )}
    </ResponsivePortal>
  );
}

TourStep.propTypes = {
  step: PropTypes.shape({
    id: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    placement: PropTypes.oneOf(PLACEMENT_OPTIONS),
    showBeacon: PropTypes.bool,
    blockInteraction: PropTypes.bool,
    customClass: PropTypes.string,
  }).isRequired,
  stepIndex: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  configuration: PropTypes.object.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onBeaconClick: PropTypes.func,
};
