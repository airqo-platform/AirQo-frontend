import { useState, useEffect } from 'react';

/**
 * Custom hook to observe the size of a DOM element using ResizeObserver.
 */
const useResizeObserver = (ref) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observeTarget = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(observeTarget);

    return () => {
      resizeObserver.unobserve(observeTarget);
    };
  }, [ref]);

  return size;
};

export default useResizeObserver;
