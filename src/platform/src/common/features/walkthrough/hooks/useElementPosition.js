import { useState, useEffect, useCallback } from 'react';
import { debounce } from '../utils/positioning';

export default function useElementPosition(element, options = {}) {
  const [position, setPosition] = useState(null);
  const {
    updateOnResize = true,
    updateOnScroll = true,
    debounceMs = 100,
  } = options;

  const updatePosition = useCallback(() => {
    if (!element) {
      setPosition(null);
      return;
    }
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;
    setPosition({
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      right: rect.right + scrollLeft,
      bottom: rect.bottom + scrollTop,
      width: rect.width,
      height: rect.height,
      centerX: rect.left + scrollLeft + rect.width / 2,
      centerY: rect.top + scrollTop + rect.height / 2,
    });
  }, [element]);

  const debouncedUpdatePosition = useCallback(
    debounce(updatePosition, debounceMs),
    [updatePosition, debounceMs],
  );

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    if (!element) return;
    const handleResize = updateOnResize ? debouncedUpdatePosition : null;
    const handleScroll = updateOnScroll ? debouncedUpdatePosition : null;
    if (handleResize) {
      window.addEventListener('resize', handleResize);
    }
    if (handleScroll) {
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      if (handleScroll) {
        window.removeEventListener('scroll', handleScroll, true);
      }
    };
  }, [element, debouncedUpdatePosition, updateOnResize, updateOnScroll]);

  return position;
}
