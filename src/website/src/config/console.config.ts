import { getEnvironmentAwareUrl } from '@/lib/environmentAwareUrl';

/**
 * Single source of truth for the AirQo API Console URL.
 * The console lives in the Nexus app at its top-level /console flow
 * (nexus.airqo.net/console; staging-nexus.airqo.net/console on staging).
 * Local override for development: NEXT_PUBLIC_CONSOLE_URL (gitignored .env.local).
 * Section URLs (e.g. subscriptions) derive from this base, so the env override applies to all.
 */
const DEFAULT_API_CONSOLE_URL = 'https://nexus.airqo.net/console';

export const API_CONSOLE_URL = (
  process.env.NEXT_PUBLIC_CONSOLE_URL ||
  getEnvironmentAwareUrl(DEFAULT_API_CONSOLE_URL)
)
  .trim()
  .replace(/\/+$/, '');

export const API_CONSOLE_SUBSCRIPTION_URL = `${API_CONSOLE_URL}/subscriptions`;
