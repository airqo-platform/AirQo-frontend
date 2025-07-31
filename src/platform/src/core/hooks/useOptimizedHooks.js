/**
 * Optimized React hooks for better performance and memory leak prevention
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  debounce,
  throttle,
  createCleanup,
} from '../utils/performanceOptimizer';

/**
 * Enhanced useState with automatic cleanup and performance optimizations
 * @param {any} initialState - Initial state value
 * @returns {Array} [state, setState, resetState]
 */
export const useOptimizedState = (initialState) => {
  const [state, setState] = useState(initialState);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeSetState = useCallback((newState) => {
    if (mountedRef.current) {
      setState(newState);
    }
  }, []);

  const resetState = useCallback(() => {
    if (mountedRef.current) {
      setState(initialState);
    }
  }, [initialState]);

  return [state, safeSetState, resetState];
};

/**
 * Debounced state hook to prevent excessive updates
 * @param {any} initialValue - Initial value
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Array} [debouncedValue, setValue, immediateValue]
 */
export const useDebouncedState = (initialValue, delay = 300) => {
  const [immediateValue, setImmediateValue] = useOptimizedState(initialValue);
  const [debouncedValue, setDebouncedValue] = useOptimizedState(initialValue);

  const debouncedSetValue = useMemo(
    () => debounce((value) => setDebouncedValue(value), delay),
    [delay, setDebouncedValue],
  );

  useEffect(() => {
    debouncedSetValue(immediateValue);
    return () => {
      debouncedSetValue.cancel();
    };
  }, [immediateValue, debouncedSetValue]);

  return [debouncedValue, setImmediateValue, immediateValue];
};

/**
 * Throttled state hook to limit update frequency
 * @param {any} initialValue - Initial value
 * @param {number} limit - Throttle limit in milliseconds
 * @returns {Array} [throttledValue, setValue]
 */
export const useThrottledState = (initialValue, limit = 100) => {
  const [value, setValue] = useOptimizedState(initialValue);

  const throttledSetValue = useMemo(
    () => throttle(setValue, limit),
    [setValue, limit],
  );

  useEffect(() => {
    return () => {
      throttledSetValue.cancel();
    };
  }, [throttledSetValue]);

  return [value, throttledSetValue];
};

/**
 * Previous value hook
 * @param {any} value - Current value
 * @returns {any} Previous value
 */
export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

/**
 * Mount status hook to prevent state updates on unmounted components
 * @returns {Object} Mount status ref
 */
export const useMountedRef = () => {
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
};

/**
 * Cleanup hook for managing cleanup functions
 * @returns {Function} Cleanup function
 */
export const useCleanup = () => {
  const cleanup = useMemo(() => createCleanup(), []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return cleanup;
};

/**
 * Optimized effect hook that only runs when dependencies actually change
 * @param {Function} effect - Effect function
 * @param {Array} deps - Dependencies array
 */
export const useOptimizedEffect = (effect, deps) => {
  const prevDeps = usePrevious(deps);
  const hasChanged = useMemo(() => {
    if (!prevDeps) return true;
    return deps.some((dep, index) => dep !== prevDeps[index]);
  }, [deps, prevDeps]);

  useEffect(() => {
    if (hasChanged) {
      return effect();
    }
  }, [effect, hasChanged]);
};

/**
 * Local storage hook with automatic serialization and error handling
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @returns {Array} [value, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          typeof value === 'function' ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch {
        // Silently handle localStorage errors
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Silently handle localStorage errors
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * Session storage hook with automatic serialization and error handling
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @returns {Array} [value, setValue, removeValue]
 */
export const useSessionStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          typeof value === 'function' ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch {
        // Silently handle sessionStorage errors
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
      }
    } catch {
      // Silently handle sessionStorage errors
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * Window event listener hook with automatic cleanup
 * @param {string} eventName - Event name
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 */
export const useWindowEvent = (eventName, handler, options = {}) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const eventHandler = (event) => handlerRef.current(event);
    window.addEventListener(eventName, eventHandler, options);

    return () => {
      window.removeEventListener(eventName, eventHandler, options);
    };
  }, [eventName, options]);
};

/**
 * Intersection observer hook for lazy loading and performance
 * @param {Object} options - Intersection observer options
 * @returns {Array} [ref, isIntersecting, entry]
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([observerEntry]) => {
      setIsIntersecting(observerEntry.isIntersecting);
      setEntry(observerEntry);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [options]);

  return [elementRef, isIntersecting, entry];
};

/**
 * Resize observer hook for responsive components
 * @param {Function} callback - Resize callback
 * @returns {Object} Element ref
 */
export const useResizeObserver = (callback) => {
  const elementRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      callbackRef.current(entries);
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, []);

  return elementRef;
};

/**
 * Performance monitoring hook
 * @param {string} name - Performance mark name
 * @param {Array} deps - Dependencies to monitor
 */
export const usePerformanceMonitor = (name, deps = []) => {
  const startTimeRef = useRef(null);
  const depsRef = useRef(deps);

  useEffect(() => {
    depsRef.current = deps;
  }, [deps]);

  useEffect(() => {
    if (typeof performance === 'undefined') return;

    startTimeRef.current = performance.now();

    return () => {
      if (startTimeRef.current) {
        const duration = performance.now() - startTimeRef.current;

        // Only log in development mode
        if (process.env.NODE_ENV === 'development' && duration > 100) {
          // Log performance issues in development
        }
      }
    };
  }, [name]);
};

/**
 * Async state hook with loading and error states
 * @param {Function} asyncFunction - Async function to execute
 * @param {Array} deps - Dependencies array
 * @returns {Object} {data, loading, error, refetch}
 */
export const useAsync = (asyncFunction) => {
  const [state, setState] = useOptimizedState({
    data: null,
    loading: false,
    error: null,
  });

  const mountedRef = useMountedRef();

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction();
      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null });
      }
    } catch (error) {
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, loading: false, error }));
      }
    }
  }, [asyncFunction, mountedRef, setState]);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { ...state, refetch };
};

/**
 * Toggle hook with optional initial value
 * @param {boolean} initialValue - Initial toggle value
 * @returns {Array} [value, toggle, setTrue, setFalse]
 */
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useOptimizedState(initialValue);

  const toggle = useCallback(() => setValue((prev) => !prev), [setValue]);
  const setTrue = useCallback(() => setValue(true), [setValue]);
  const setFalse = useCallback(() => setValue(false), [setValue]);

  return [value, toggle, setTrue, setFalse];
};

const optimizedHooks = {
  useOptimizedState,
  useDebouncedState,
  useThrottledState,
  usePrevious,
  useMountedRef,
  useCleanup,
  useOptimizedEffect,
  useLocalStorage,
  useSessionStorage,
  useWindowEvent,
  useIntersectionObserver,
  useResizeObserver,
  usePerformanceMonitor,
  useAsync,
  useToggle,
};

export default optimizedHooks;
