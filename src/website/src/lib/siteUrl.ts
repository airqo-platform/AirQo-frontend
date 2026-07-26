/**
 * Dynamic site URL resolution.
 *
 * No hardcoded domains, no environment variables required.
 * The site URL is always detected at runtime from the request's
 * Host header (server-side) or from window.location (client-side).
 */

const LOCAL_DEV_SITE_URL = 'http://localhost:3000';

// Valid hostname pattern: alphanumeric, dots, hyphens, or IPv6 in brackets
const HOSTNAME_PATTERN = /^[a-z0-9.-]+$|^\[[0-9a-f:]+\]$/i;

const normalizeSiteUrl = (value: string): string =>
  value.trim().replace(/\/+$/, '');

const toAbsoluteSiteUrl = (value: string): string => {
  if (/^https?:\/\//i.test(value)) {
    return normalizeSiteUrl(value);
  }
  return normalizeSiteUrl(`https://${value}`);
};

/**
 * Validate a hostname against basic syntax rules.
 */
const isValidHostname = (hostname: string): boolean =>
  HOSTNAME_PATTERN.test(hostname);

/**
 * Get the list of allowed hosts from environment.
 * If empty, all valid hostnames are allowed.
 */
const getAllowedHosts = (): string[] =>
  (process.env.ALLOWED_SITE_HOSTS ?? '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);

/**
 * Detect the site URL from a Host header value.
 * Validates the hostname and checks against an allowlist if configured.
 *
 * @param hostHeader - The value of the Host or x-forwarded-host header
 * @param protocol - The protocol to use (defaults to https)
 * @returns The full site URL, or null if the header is empty/invalid
 */
export const detectSiteUrlFromHeaders = (
  hostHeader: string | null,
  protocol = 'https',
): string | null => {
  if (!hostHeader) return null;

  // Extract host (hostname + port), strip any path
  const host = hostHeader.trim().split('/')[0]?.trim();
  if (!host) return null;

  // Extract just the hostname (before the last colon for port)
  const hostname = host.includes('[')
    ? host.slice(1, host.indexOf(']'))
    : host.includes(':')
      ? host.slice(0, host.lastIndexOf(':'))
      : host;

  // Validate hostname syntax
  if (!isValidHostname(hostname)) return null;

  // Check allowlist if configured
  const allowed = getAllowedHosts();
  if (allowed.length > 0 && !allowed.includes(hostname.toLowerCase())) {
    return null;
  }

  return normalizeSiteUrl(`${protocol}://${host}`);
};

/**
 * Get the primary site URL at runtime.
 *
 * Detection priority:
 * 1. Host header (server-side, most accurate)
 * 2. window.location.origin (client-side - always prefer real origin)
 * 3. Vercel preview URL
 * 4. Platform-specific env vars (Railway, Render, etc.)
 * 5. localhost fallback (development only)
 *
 * @param hostHeader - Optional Host header value for server-side detection.
 *                     Pass this from headers().get('x-forwarded-host') ?? headers().get('host')
 */
export const getPrimarySiteUrl = (hostHeader?: string | null): string => {
  // Method 1: Host header detection (most reliable for server components)
  if (hostHeader) {
    const detected = detectSiteUrlFromHeaders(hostHeader);
    if (detected) return detected;
  }

  // Method 2: Client-side detection (browser origin always wins)
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  // Method 3: Vercel preview URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return toAbsoluteSiteUrl(process.env.NEXT_PUBLIC_VERCEL_URL);
  }

  // Method 4: Platform-specific environment variables
  if (typeof process !== 'undefined') {
    const platformHost =
      process.env.VERCEL_URL ||
      process.env.RAILWAY_PUBLIC_DOMAIN ||
      process.env.RENDER_EXTERNAL_URL;

    if (platformHost) {
      return toAbsoluteSiteUrl(platformHost);
    }
  }

  // Development fallback
  return LOCAL_DEV_SITE_URL;
};

export const resolveSiteUrl = (
  candidate?: string | null,
  hostHeader?: string | null,
): string => {
  const primarySiteUrl = getPrimarySiteUrl(hostHeader);
  if (!candidate) return primarySiteUrl;
  return toAbsoluteSiteUrl(candidate);
};

export const buildSiteUrl = (
  path: string,
  candidate?: string | null,
): string => {
  const baseUrl = resolveSiteUrl(candidate);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};
