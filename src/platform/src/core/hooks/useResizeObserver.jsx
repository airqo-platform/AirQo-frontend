import { useEffect, useState } from 'react';

/**
 * Custom hook to handle ResizeObserver
 * @param {React.RefObject} ref - The ref to observe
 * @param {Function} callback - Optional callback to execute on resize
 * @returns {Object} - Returns size dimensions when no callback provided
 */
export const useResizeObserver = (ref, callback) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !ref.current ||
      !window.ResizeObserver
    ) {
      return;
    }

    const observer = new window.ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const newSize = { width, height };

        // Update state for hooks that need size dimensions
        setSize(newSize);

        // Call callback if provided
        if (callback) {
          callback(entries);
        }
      }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, callback]);
  // Return size dimensions when no callback is provided
  return callback ? undefined : size;
};

export default useResizeObserver;
