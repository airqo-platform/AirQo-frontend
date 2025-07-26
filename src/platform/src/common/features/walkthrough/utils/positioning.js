export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function getViewportDimensions() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

export function calculateOptimalPlacement(
  targetPosition,
  tooltipRect,
  viewport,
  configuration = {},
) {
  const spacing = configuration.spacing || 12;
  const preferences = ['bottom', 'top', 'right', 'left'];
  for (const placement of preferences) {
    if (
      hasEnoughSpace(targetPosition, tooltipRect, viewport, placement, spacing)
    ) {
      return placement;
    }
  }
  return 'bottom';
}

function hasEnoughSpace(
  targetPosition,
  tooltipRect,
  viewport,
  placement,
  spacing,
) {
  switch (placement) {
    case 'top':
      return targetPosition.top - tooltipRect.height - spacing >= 0;
    case 'bottom':
      return (
        targetPosition.bottom + tooltipRect.height + spacing <= viewport.height
      );
    case 'left':
      return targetPosition.left - tooltipRect.width - spacing >= 0;
    case 'right':
      return (
        targetPosition.right + tooltipRect.width + spacing <= viewport.width
      );
    default:
      return false;
  }
}

export function getElementCenter(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function isElementInViewport(element, threshold = 0) {
  const rect = element.getBoundingClientRect();
  const viewport = getViewportDimensions();
  return (
    rect.top >= -threshold &&
    rect.left >= -threshold &&
    rect.bottom <= viewport.height + threshold &&
    rect.right <= viewport.width + threshold
  );
}
