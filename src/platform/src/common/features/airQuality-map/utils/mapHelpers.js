import { MAP_CONFIG } from '../constants/mapConstants';

/**
 * Parses URL parameters for map viewport
 */
export const parseUrlParams = () => {
  if (typeof window === 'undefined') return { valid: false };

  const params = new URLSearchParams(window.location.search);
  const lat = parseFloat(params.get('lat'));
  const lng = parseFloat(params.get('lng'));
  const zm = parseFloat(params.get('zm'));

  return {
    lat,
    lng,
    zm,
    valid: !isNaN(lat) && !isNaN(lng) && !isNaN(zm),
  };
};

/**
 * Determines if viewport should be updated
 */
export const shouldUpdateViewport = (urlParams, reduxCenter) => {
  return urlParams.valid
    ? [urlParams.lng, urlParams.lat]
    : [reduxCenter.longitude, reduxCenter.latitude];
};

/**
 * Gets initial zoom level
 */
export const getInitialZoom = (urlParams, reduxZoom) => {
  return urlParams.valid ? urlParams.zm : reduxZoom;
};

/**
 * Debounced function creator
 */
export const createDebouncer = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Checks if screen width is desktop
 */
export const isDesktop = (width) =>
  width >= MAP_CONFIG.BREAKPOINTS.DESKTOP_MIN_WIDTH;

/**
 * Safe function execution with error handling
 */
export const safeExecute = (fn, fallback = () => {}) => {
  try {
    return fn();
  } catch (error) {
    console.error('Safe execution failed:', error);
    return fallback();
  }
};
