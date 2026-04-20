const LOCAL_DEV_SITE_URL = 'http://localhost:3000';

const normalizeSiteUrl = (value: string): string =>
  value.trim().replace(/\/+$/, '');

const hasScheme = (value: string): boolean => /^https?:\/\//i.test(value);

const toAbsoluteSiteUrl = (value: string): string =>
  normalizeSiteUrl(hasScheme(value) ? value : `https://${value}`);

export const parseSiteUrls = (rawValue?: string | null): string[] => {
  if (!rawValue) return [];

  return rawValue
    .split(/[\s,]+/)
    .map((value) => normalizeSiteUrl(value))
    .filter(Boolean)
    .map((value) => toAbsoluteSiteUrl(value))
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

  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_SITE_URL must be configured in production.');
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
