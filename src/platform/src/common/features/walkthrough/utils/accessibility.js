export function getAriaAttributes(step, stepIndex, totalSteps) {
  return {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': `walkthrough-title-${step.id}`,
    'aria-describedby': `walkthrough-content-${step.id}`,
    'aria-live': 'polite',
    'aria-atomic': 'true',
    'aria-label': `Tour step ${stepIndex + 1} of ${totalSteps}: ${step.title}`,
  };
}

export function createAriaLiveRegion() {
  const existingRegion = document.getElementById('walkthrough-aria-live');
  if (existingRegion) {
    return existingRegion;
  }
  const liveRegion = document.createElement('div');
  liveRegion.id = 'walkthrough-aria-live';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.style.position = 'absolute';
  liveRegion.style.left = '-10000px';
  liveRegion.style.width = '1px';
  liveRegion.style.height = '1px';
  liveRegion.style.overflow = 'hidden';
  document.body.appendChild(liveRegion);
  return liveRegion;
}

export function announceToScreenReader(message) {
  const liveRegion = createAriaLiveRegion();
  liveRegion.textContent = message;
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 1000);
}

export function manageFocus(element, shouldFocus = true) {
  if (!element) return;
  if (shouldFocus) {
    const previouslyFocused = document.activeElement;
    element.setAttribute('data-previously-focused', 'true');
    element.focus();
    return () => {
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  }
}

export function trapFocus(container) {
  if (!container) return;
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };
  container.addEventListener('keydown', handleKeyDown);
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}
