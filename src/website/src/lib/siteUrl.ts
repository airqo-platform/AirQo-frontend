/**
 * Dynamic site URL resolution.
 *
 * No hardcoded domains, no environment variables required.
 * The site URL is always detected at runtime from the request's
 * Host header (server-side) or from window.location (client-side).
 */

const LOCAL_DEV_SITE_URL = 'http://localhost:3000';

const normalizeSiteUrl = (value: string): string =>
  value.trim().replace(/\/+$/, '');

const toAbsoluteSiteUrl = (value: string): string => {
  if (/^https?:\/\//i.test(value)) {
    return normalizeSiteUrl(value);
  }
  return normalizeSiteUrl(`https://${value}`);
};

/**
 * Extract hostname from a Host header value, handling IPv6 addresses.
 *
 * @example
 * extractHostname('airqo.africa:443') // 'airqo.africa'
 * extractHostname('[::1]:3000')       // '::1'
 * extractHostname('localhost')        // 'localhost'
 */
const extractHostname = (hostHeader: string): string => {
  const trimmed = hostHeader.trim();

  // IPv6: starts with '[' -- extract everything between brackets
  if (trimmed.startsWith('[')) {
    const closeBracket = trimmed.indexOf(']');
    if (closeBracket > 1) {
      return trimmed.slice(1, closeBracket);
    }
  }

  // Standard hostname:port -- strip the port
  const colonIndex = trimmed.lastIndexOf(':');
  if (colonIndex > 0) {
    return trimmed.slice(0, colonIndex);
  }

  return trimmed;
};

/**
 * Detect the site URL from a Host header value.
 * Works with or without port numbers (e.g. "airqo.africa" or "localhost:3000").
 *
 * @param hostHeader - The value of the Host or x-forwarded-host header
 * @param protocol - The protocol to use (defaults to https)
 * @returns The full site URL, or null if the header is empty
 */
export const detectSiteUrlFromHeaders = (
  hostHeader: string | null,
  protocol = 'https',
): string | null => {
  if (!hostHeader) return null;

  const hostname = extractHostname(hostHeader);
  if (!hostname) return null;

  return normalizeSiteUrl(`${protocol}://${hostname}`);
};

/**
 * Get the primary site URL at runtime.
 *
 * Detection priority:
 * 1. Host header (server-side, most accurate)
 * 2. Vercel preview URL
 * 3. Platform-specific env vars (Railway, Render, etc.)
 * 4. window.location.origin (client-side)
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

  // Method 2: Vercel preview URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return toAbsoluteSiteUrl(process.env.NEXT_PUBLIC_VERCEL_URL);
  }

  // Method 3: Platform-specific environment variables
  if (typeof process !== 'undefined') {
    const platformHost =
      process.env.VERCEL_URL ||
      process.env.RAILWAY_PUBLIC_DOMAIN ||
      process.env.RENDER_EXTERNAL_URL;

    if (platformHost) {
      return toAbsoluteSiteUrl(platformHost);
    }
  }

  // Method 4: Client-side detection
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    if (origin && !origin.includes('localhost')) {
      return origin;
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
