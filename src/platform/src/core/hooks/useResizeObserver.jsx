import { useEffect } from 'react';

/**
 * Custom hook to handle ResizeObserver
 * @param {React.RefObject} ref - The ref to observe
 * @param {Function} callback - The callback to execute on resize
 */
export const useResizeObserver = (ref, callback) => {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !ref.current ||
      !window.ResizeObserver
    ) {
      return;
    }

    const observer = new window.ResizeObserver(callback);
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, callback]);
};

export default useResizeObserver;
