import ReactGA from 'react-ga4';

/**
 * Simple FNV-1a hash function for client-side anonymization
 * We use this instead of crypto.subtle to keep it synchronous and fast
 */
export const hashId = (str: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
};

/**
 * Anonymizes site data for analytics
 */
export const anonymizeSiteData = (siteId: string) => {
  return {
    site_id_hashed: hashId(siteId),
    // We don't include the name at all
  };
};

/**
 * Track events to both PostHog and Google Analytics
 */
export const trackEvent = (
  eventName: string,
  properties?: Record<string, unknown>
) => {
  // Track to Google Analytics
  try {
    ReactGA.event({
      category: 'engagement',
      action: eventName,
      ...properties,
    });
  } catch (error) {
    console.warn('Google Analytics tracking failed:', error);
  }

  // Note: PostHog tracking is handled by individual components using usePostHog hook
  // This function focuses on GA tracking to avoid duplicating PostHog logic
};

/**
 * Track page views to Google Analytics
 */
export const trackPageView = (page: string) => {
  try {
    ReactGA.send({ hitType: 'pageview', page });
  } catch (error) {
    console.warn('Google Analytics pageview tracking failed:', error);
  }
};
