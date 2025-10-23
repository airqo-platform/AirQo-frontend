import { useEffect, useRef } from 'react';

export function useResizeObserver<T extends HTMLElement>(
  element: T | null,
  callback: () => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(() => callbackRef.current());
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
}
