import { useState, useEffect, useCallback } from 'react';
import {
  calculateOptimalPlacement,
  getViewportDimensions,
} from '../utils/positioning';

export default function useResponsivePosition({
  targetPosition,
  placement = 'auto',
  tooltipRef,
  configuration = {},
}) {
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    transform: '',
    placement: 'bottom',
  });
  const calculatePosition = useCallback(() => {
    if (!targetPosition || !tooltipRef.current) {
      return;
    }
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = getViewportDimensions();
    const optimalPlacement =
      placement === 'auto'
        ? calculateOptimalPlacement(
            targetPosition,
            tooltipRect,
            viewport,
            configuration,
          )
        : placement;
    let top, left, transform;
    const spacing = configuration.spacing || 12;
    switch (optimalPlacement) {
      case 'top':
        top = targetPosition.top - tooltipRect.height - spacing;
        left = targetPosition.centerX;
        transform = 'translateX(-50%)';
        break;
      case 'bottom':
        top = targetPosition.bottom + spacing;
        left = targetPosition.centerX;
        transform = 'translateX(-50%)';
        break;
      case 'left':
        top = targetPosition.centerY;
        left = targetPosition.left - tooltipRect.width - spacing;
        transform = 'translateY(-50%)';
        break;
      case 'right':
        top = targetPosition.centerY;
        left = targetPosition.right + spacing;
        transform = 'translateY(-50%)';
        break;
      default:
        top = targetPosition.bottom + spacing;
        left = targetPosition.centerX;
        transform = 'translateX(-50%)';
    }
    if (left < spacing) {
      left = spacing;
      transform = 'translateX(0)';
    } else if (left + tooltipRect.width > viewport.width - spacing) {
      left = viewport.width - tooltipRect.width - spacing;
      transform = 'translateX(0)';
    }
    if (top < spacing) {
      top = spacing;
    } else if (top + tooltipRect.height > viewport.height - spacing) {
      top = viewport.height - tooltipRect.height - spacing;
    }
    setPosition({
      top,
      left,
      transform,
      placement: optimalPlacement,
    });
  }, [targetPosition, placement, tooltipRef, configuration]);

  useEffect(() => {
    calculatePosition();
  }, [calculatePosition]);

  useEffect(() => {
    const handleResize = () => calculatePosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculatePosition]);

  return position;
}
