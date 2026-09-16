/**
 * Dynamic site URL resolution.
 *
 * Resolves the public site URL at runtime/build-time using (in priority order):
 *  1. request Host header (dynamic server pages)
 *  2. window.location.origin (client-side real browsing origin)
 *  3. NEXT_PUBLIC_SITE_URL env (build-time/static canonical)
 *  4. NEXT_PUBLIC_VERCEL_URL / VERCEL_URL / RAILWAY_PUBLIC_DOMAIN /
 *     RENDER_EXTERNAL_URL
 *  5. localhost fallback (development only)
 *
 * NEXT_PUBLIC_SITE_URL may be a comma- or whitespace-separated list; the first
 * valid entry is the canonical base used for metadata, canonical links,
 * og:url, sitemaps, robots, and JSON-LD.
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
 * Parse a NEXT_PUBLIC_SITE_URL value into a de-duplicated list of valid,
 * absolute site URLs.
 *
 * Splits on commas and/or whitespace, trims, strips trailing slashes, requires
 * an http/https scheme (prepends https for bare hosts), and drops invalid
 * entries. First valid entry is the canonical/primary URL.
 */
export const parseSiteUrls = (raw?: string | null): string[] => {
  if (!raw) return [];

  const urls = raw
    .split(/[\s,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const cleaned = entry.replace(/\/+$/, '');

      // Has an explicit scheme (ftp://, ws://, etc.) — leave as-is so the
      // protocol filter below can reject non-http schemes.
      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(cleaned)) {
        return cleaned;
      }

      // Bare host (no scheme) — prepend https
      return `https://${cleaned}`;
    })
    .filter((entry) => {
      let parsed: URL;
      try {
        parsed = new URL(entry);
      } catch {
        return false;
      }

      // Require http/https scheme
      if (!/^https?:$/i.test(parsed.protocol)) return false;

      // Validate hostname: must be localhost, an IP, or contain a dot
      // (drops bare tokens like "not-a-url" that otherwise parse cleanly)
      const host = parsed.hostname;
      return (
        host === 'localhost' ||
        /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ||
        host.includes('.')
      );
    })
    .map((entry) => normalizeSiteUrl(entry));

  // Dedupe while preserving order
  return [...new Set(urls)];
};

/**
 * Get the configured site URLs from NEXT_PUBLIC_SITE_URL.
 */
export const getConfiguredSiteUrls = (): string[] =>
  parseSiteUrls(process.env.NEXT_PUBLIC_SITE_URL);

// Ensures the production misconfiguration warning fires at most once.
let productionWarningEmitted = false;

/**
 * Detect the site URL from a Host header value.
 * Validates the hostname and checks against an allowlist if configured.
 *
 * Accepts only http/https protocol values (falls back to https otherwise).
 * Takes the first entry from a comma-separated forwarded host value.
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

  // Accept only http/https protocol values; fall back to https otherwise.
  const safeProtocol = /^https?$/i.test(protocol) ? protocol : 'https';

  // Take the first entry from a comma-separated forwarded host value.
  const firstHeader = hostHeader.split(',')[0]?.trim();
  if (!firstHeader) return null;

  // Extract host (hostname + port), strip any path
  const host = firstHeader.split('/')[0]?.trim();
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

  return normalizeSiteUrl(`${safeProtocol}://${host}`);
};

/**
 * Get the primary site URL at runtime.
 *
 * Detection priority:
 * 1. Host header (server-side, most accurate)
 * 2. window.location.origin (client-side - always prefer real origin)
 * 3. NEXT_PUBLIC_SITE_URL (first configured entry)
 * 4. Vercel preview URL
 * 5. Platform-specific env vars (Railway, Render, etc.)
 * 6. localhost fallback (development only)
 *
 * @param hostHeader - Optional Host header value for server-side detection.
 *                     Pass this from headers().get('x-forwarded-host') ??
 *                     headers().get('host')
 * @param protocol - The protocol to use for header detection (defaults to https)
 */
export const getPrimarySiteUrl = (
  hostHeader?: string | null,
  protocol = 'https',
): string => {
  // Method 1: Host header detection (most reliable for server components)
  if (hostHeader) {
    const detected = detectSiteUrlFromHeaders(hostHeader, protocol);
    if (detected) return detected;
  }

  // Method 2: Client-side detection (browser origin always wins)
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  // Method 3: NEXT_PUBLIC_SITE_URL (first configured entry)
  const configured = getConfiguredSiteUrls();
  if (configured.length > 0) {
    return configured[0];
  }

  // Method 4: Vercel preview URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return toAbsoluteSiteUrl(process.env.NEXT_PUBLIC_VERCEL_URL);
  }

  // Method 5: Platform-specific environment variables
  if (typeof process !== 'undefined') {
    const platformHost =
      process.env.VERCEL_URL ||
      process.env.RAILWAY_PUBLIC_DOMAIN ||
      process.env.RENDER_EXTERNAL_URL;

    if (platformHost) {
      return toAbsoluteSiteUrl(platformHost);
    }
  }

  // Production safety warn (once) when falling back to localhost.
  if (process.env.NODE_ENV === 'production' && !productionWarningEmitted) {
    productionWarningEmitted = true;
    if (typeof console !== 'undefined') {
      console.warn(
        '[siteUrl] NEXT_PUBLIC_SITE_URL is not configured in production. ' +
          'Falling back to localhost. Canonical/og:url metadata will be wrong.',
      );
    }
  }

  // Development fallback
  return LOCAL_DEV_SITE_URL;
};

export const resolveSiteUrl = (
  candidate?: string | null,
  hostHeader?: string | null,
  protocol = 'https',
): string => {
  const primarySiteUrl = getPrimarySiteUrl(hostHeader, protocol);
  if (!candidate) return primarySiteUrl;
  return toAbsoluteSiteUrl(candidate);
};

export const buildSiteUrl = (
  path: string,
  candidate?: string | null,
  hostHeader?: string | null,
  protocol = 'https',
): string => {
  const baseUrl = resolveSiteUrl(candidate, hostHeader, protocol);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};
