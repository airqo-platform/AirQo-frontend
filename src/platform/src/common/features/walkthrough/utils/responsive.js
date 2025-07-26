export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

export function getCurrentBreakpoint() {
  const width = window.innerWidth;
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
}

export function isMobile() {
  return getCurrentBreakpoint() === 'mobile';
}

export function isTablet() {
  return getCurrentBreakpoint() === 'tablet';
}

export function isDesktop() {
  return getCurrentBreakpoint() === 'desktop';
}

export function getResponsiveConfiguration(configuration) {
  const breakpoint = getCurrentBreakpoint();
  const responsive = configuration.responsive || {};
  return {
    ...configuration,
    ...responsive[breakpoint],
  };
}

export function createMediaQueryListener(query, callback) {
  const mediaQuery = window.matchMedia(query);
  mediaQuery.addListener(callback);
  callback(mediaQuery);
  return () => {
    mediaQuery.removeListener(callback);
  };
}

export function useResponsiveValue(values, defaultValue) {
  const breakpoint = getCurrentBreakpoint();
  return values[breakpoint] || defaultValue;
}
