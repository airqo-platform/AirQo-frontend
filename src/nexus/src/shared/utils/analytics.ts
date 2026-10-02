import posthog from 'posthog-js';
import type { PostHog } from 'posthog-js';
import ReactGA from 'react-ga4';
import { AIRQO_APP_NAME } from './analyticsConstants';

const ANALYTICS_EVENT_REDACTIONS = new Set([
  'email',
  'user_email',
  'phone',
  'phone_number',
  'password',
  'token',
  'user_id',
  'userid',
  'name',
  'user_name',
  'username',
  'first_name',
  'last_name',
  'full_name',
  'site_id',
  'site_ids',
  'location_id',
  'location_ids',
  'site_name',
  'location_name',
  'chart_title',
  'title',
]);

const isSensitiveAnalyticsKey = (key: string): boolean => {
  const normalizedKey = key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
  if (
    normalizedKey === 'has_token' ||
    normalizedKey === 'token_status' ||
    normalizedKey === 'user_email_hash' ||
    normalizedKey === 'location_id_hashed' ||
    normalizedKey === 'location_name_hashed' ||
    normalizedKey === 'site_id_hashed'
  ) {
    return false;
  }

  return (
    ANALYTICS_EVENT_REDACTIONS.has(normalizedKey) ||
    /(?:^|_)(?:password|token|secret|authorization|api_key)(?:_|$)|(?:email|phone)/i.test(
      normalizedKey
    ) ||
    /(?:^|_)(?:site|location)_ids?$/i.test(normalizedKey) ||
    /(?:^|_)(?:site|location)_names?$/i.test(normalizedKey)
  );
};

const sanitizeAnalyticsProperties = (
  properties: Record<string, unknown>
): Record<string, unknown> =>
  Object.entries(properties).reduce<Record<string, unknown>>(
    (sanitized, [key, value]) => {
      if (isSensitiveAnalyticsKey(key) || value === undefined) {
        return sanitized;
      }

      if (Array.isArray(value)) {
        sanitized[key] = value.map(item =>
          item && typeof item === 'object' && !Array.isArray(item)
            ? sanitizeAnalyticsProperties(item as Record<string, unknown>)
            : item
        );
      } else if (value && typeof value === 'object') {
        sanitized[key] = sanitizeAnalyticsProperties(
          value as Record<string, unknown>
        );
      } else {
        sanitized[key] = value;
      }

      return sanitized;
    },
    {}
  );

const getProductFlow = (): 'individual' | 'organization' | 'shared' => {
  if (typeof window === 'undefined') return 'shared';

  const pathname = window.location.pathname;
  if (pathname.startsWith('/org/')) return 'organization';
  if (pathname.startsWith('/user/')) return 'individual';
  return 'shared';
};

/**
 * Capture a PostHog event through one privacy-aware path. Behavioral events
 * use the identified person's distinct ID; callers should not add user IDs
 * or direct identifiers to event properties.
 */
export const capturePostHogEvent = (
  client: Pick<PostHog, 'capture'> | null | undefined,
  eventName: string,
  properties: Record<string, unknown> = {},
  options?: Parameters<PostHog['capture']>[2]
): void => {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

  const analyticsClient = client || posthog;
  analyticsClient.capture(
    eventName,
    {
      ...sanitizeAnalyticsProperties(properties),
      app_name: AIRQO_APP_NAME,
      app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      product_flow: getProductFlow(),
    },
    options
  );
};

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
 * Track events to both PostHog and Google Analytics.
 */
export const trackEvent = (
  eventName: string,
  properties?: Record<string, unknown>
) => {
  capturePostHogEvent(null, eventName, properties);

  // Track to Google Analytics
  try {
    ReactGA.event({
      category: 'engagement',
      action: eventName,
      ...sanitizeAnalyticsProperties(properties || {}),
      app_name: AIRQO_APP_NAME,
    } as never);
  } catch (error) {
    console.warn('Google Analytics tracking failed:', error);
  }
};

/**
 * Track page views to Google Analytics
 */
export const trackPageView = (page: string) => {
  try {
    ReactGA.send({
      hitType: 'pageview',
      page,
      app_name: AIRQO_APP_NAME,
    } as never);
  } catch (error) {
    console.warn('Google Analytics pageview tracking failed:', error);
  }
};
