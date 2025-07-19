// features/airQuality-map/hooks/useMemoryManagement.js
import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for managing memory and preventing memory leaks
 */
export const useMemoryManagement = (mapRef) => {
  const timeoutsRef = useRef(new Set());
  const intervalsRef = useRef(new Set());
  const listenersRef = useRef(new Map());

  // Safe timeout management
  const setSafeTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => {
      timeoutsRef.current.delete(timeoutId);
      callback();
    }, delay);

    timeoutsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  // Safe interval management
  const setSafeInterval = useCallback((callback, delay) => {
    const intervalId = setInterval(callback, delay);
    intervalsRef.current.add(intervalId);
    return intervalId;
  }, []);

  // Safe event listener management
  const addSafeEventListener = useCallback(
    (element, event, handler, options = {}) => {
      element.addEventListener(event, handler, options);

      const key = `${element.constructor.name}_${event}`;
      if (!listenersRef.current.has(key)) {
        listenersRef.current.set(key, []);
      }
      listenersRef.current.get(key).push({ element, event, handler, options });
    },
    [],
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutsRef.current.clear();

    // Clear all intervals
    intervalsRef.current.forEach((intervalId) => clearInterval(intervalId));
    intervalsRef.current.clear();

    // Remove all event listeners
    listenersRef.current.forEach((listeners) => {
      listeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    listenersRef.current.clear();

    // Clean up map resources
    if (mapRef.current) {
      try {
        // Remove all map event listeners
        mapRef.current.off();

        // Remove map from DOM
        mapRef.current.remove();
        mapRef.current = null;
      } catch (error) {
        console.warn('Error during map cleanup:', error);
      }
    }
  }, [mapRef]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    setSafeTimeout,
    setSafeInterval,
    addSafeEventListener,
    cleanup,
  };
};

// Export the memory management hook
export { useMemoryManagement };
