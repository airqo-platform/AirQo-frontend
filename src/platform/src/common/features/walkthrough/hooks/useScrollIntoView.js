import { useEffect } from 'react';

export default function useScrollIntoView(element, options = {}) {
  const {
    isActive = true,
    behavior = 'smooth',
    offset = 20,
    respectReducedMotion = true,
  } = options;

  useEffect(() => {
    if (!isActive || !element) return;
    const prefersReducedMotion =
      respectReducedMotion &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior = prefersReducedMotion ? 'auto' : behavior;
    const elementRect = element.getBoundingClientRect();
    const isInViewport =
      elementRect.top >= 0 &&
      elementRect.left >= 0 &&
      elementRect.bottom <= window.innerHeight &&
      elementRect.right <= window.innerWidth;
    if (!isInViewport) {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const targetY = elementRect.top + scrollTop - offset;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: scrollBehavior,
      });
    }
  }, [element, isActive, behavior, offset, respectReducedMotion]);
}
