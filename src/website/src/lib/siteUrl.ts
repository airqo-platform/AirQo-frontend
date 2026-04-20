const LOCAL_DEV_SITE_URL = 'http://localhost:3000';

const normalizeSiteUrl = (value: string): string =>
  value.trim().replace(/\/+$/, '');

// Detect any URI scheme per RFC 3986 (e.g. "ftp:", "http:"). Returns the
// scheme without the trailing colon (lower-cased) or `null` when no scheme is
// present.
const detectScheme = (value: string): string | null => {
  const match = value.trim().match(/^([A-Za-z][A-Za-z0-9+.-]*):/);
  return match ? match[1].toLowerCase() : null;
};

const isHttpScheme = (scheme: string | null): boolean =>
  scheme === 'http' || scheme === 'https';

const toAbsoluteSiteUrl = (value: string): string => {
  const scheme = detectScheme(value);

  // If a scheme exists but it's not http/https, reject the value by
  // returning an empty string — downstream filters will drop it so we don't
  // silently rewrite unsupported schemes (e.g. ftp://... -> https://ftp://...).
  if (scheme && !isHttpScheme(scheme)) return '';

  // If the value already has an http(s) scheme, return as-is; otherwise
  // assume HTTPS for host-only values.
  if (scheme) {
    return normalizeSiteUrl(value);
  }

  return normalizeSiteUrl(`https://${value}`);
};

export const parseSiteUrls = (rawValue?: string | null): string[] => {
  if (!rawValue) return [];

  return rawValue
    .split(/[\s,]+/)
    .map((value) => normalizeSiteUrl(value))
    .filter(Boolean)
    .map((value) => toAbsoluteSiteUrl(value))
    .filter((value): value is string => Boolean(value))
    .filter((value, index, values) => values.indexOf(value) === index)
    .filter((value) => {
      try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    });
};

export const getConfiguredSiteUrls = (): string[] =>
  parseSiteUrls(process.env.NEXT_PUBLIC_SITE_URL);

export const getPrimarySiteUrl = (): string => {
  const [primarySiteUrl] = getConfiguredSiteUrls();
  if (primarySiteUrl) return primarySiteUrl;

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return toAbsoluteSiteUrl(process.env.NEXT_PUBLIC_VERCEL_URL);
  }

  // In some build environments (Docker/CI) the build runs with NODE_ENV=production
  // but build-time environment variables may not be provided. To avoid hard
  // failing during those builds, fall back to `LOCAL_DEV_SITE_URL` unless the
  // consumer explicitly enables strict enforcement via
  // `NEXT_PUBLIC_REQUIRE_SITE_URL=true`.
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_REQUIRE_SITE_URL === 'true') {
      throw new Error('NEXT_PUBLIC_SITE_URL must be configured in production.');
    }

    // Log a single-line warning so CI/Docker logs show the missing config,
    // then fall back to a safe localhost URL to allow the build to complete.
    // eslint-disable-next-line no-console
    console.warn(
      'Warning: NEXT_PUBLIC_SITE_URL not set. Falling back to http://localhost:3000 for build.',
    );
  }

  return LOCAL_DEV_SITE_URL;
};

export const resolveSiteUrl = (candidate?: string | null): string => {
  const configuredSiteUrls = getConfiguredSiteUrls();
  const primarySiteUrl = getPrimarySiteUrl();

  if (!candidate) return primarySiteUrl;

  try {
    const normalizedCandidate = toAbsoluteSiteUrl(candidate);
    const candidateHostname = new URL(normalizedCandidate).hostname;
    const matchedSiteUrl = configuredSiteUrls.find((siteUrl) => {
      return new URL(siteUrl).hostname === candidateHostname;
    });

    return matchedSiteUrl ?? primarySiteUrl;
  } catch {
    return primarySiteUrl;
  }
};

export const buildSiteUrl = (
  path: string,
  candidate?: string | null,
): string => {
  const baseUrl = resolveSiteUrl(candidate);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};
