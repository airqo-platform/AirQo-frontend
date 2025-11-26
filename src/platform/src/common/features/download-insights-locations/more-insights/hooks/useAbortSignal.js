import { useRef, useEffect } from 'react';

export default function useAbortSignal() {
  const abortRef = useRef();
  useEffect(() => () => abortRef.current?.abort?.(), []);
  return () => {
    abortRef.current?.abort?.();
    abortRef.current = new AbortController();
    return abortRef.current.signal;
  };
}
