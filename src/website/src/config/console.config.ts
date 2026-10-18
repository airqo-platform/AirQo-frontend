/**
 * Single source of truth for the AirQo API Console URL.
 * The console lives in the Nexus app at its top-level /console flow
 * (nexus.airqo.net/console; staging-nexus.airqo.net/console on staging).
 * The environment is detected from NEXT_PUBLIC_SITE_URL, which is inlined at
 * build time and therefore identical during SSR and hydration (no window
 * access, no server/client mismatch). NEXT_PUBLIC_CONSOLE_URL overrides the
 * resolved base URL (used for local testing via a gitignored .env.local).
 * Section URLs (e.g. subscriptions) derive from this base, so the env
 * override applies to all.
 */
const DEFAULT_API_CONSOLE_URL = 'https://nexus.airqo.net/console';
const STAGING_API_CONSOLE_URL = 'https://staging-nexus.airqo.net/console';

const resolveConsoleBaseUrl = (): string => {
  const override = process.env.NEXT_PUBLIC_CONSOLE_URL?.trim();
  if (override) return override;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '')
    .split(',')[0]
    .trim()
    .toLowerCase();

  return siteUrl.includes('staging')
    ? STAGING_API_CONSOLE_URL
    : DEFAULT_API_CONSOLE_URL;
};

export const API_CONSOLE_URL = resolveConsoleBaseUrl()
  .trim()
  .replace(/\/+$/, '');

export const API_CONSOLE_SUBSCRIPTION_URL = `${API_CONSOLE_URL}/subscriptions`;
