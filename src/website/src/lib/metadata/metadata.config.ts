export interface ImageMetadata {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  type?: string;
}

export interface MetadataConfig {
  title: string;
  description: string;
  keywords?: string;
  url: string;
  image?: ImageMetadata;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}

export const DEFAULT_METADATA = {
  siteName: 'AirQo',
  defaultDescription:
    'AirQo works with African communities to measure air quality and support research, public awareness, and action.',
  defaultImage: {
    url: '/assets/images/seo/airqo-social-fallback.jpg',
    alt: 'AirQo team members working with air quality monitoring equipment',
    width: 1200,
    height: 630,
    type: 'image/jpeg',
  },
  twitterHandle: '@AirQoProject',
  locale: 'en_US',
  themeColor: '#145DFF',
} as const;

export const cleanMetadataText = (
  value: string | null | undefined,
  fallback: string,
  maxLength = 200,
): string => {
  const text = (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
  const resolved = text || fallback;

  if (resolved.length <= maxLength) return resolved;

  const excerpt = resolved.slice(0, Math.max(0, maxLength - 3));
  const boundary = excerpt.lastIndexOf(' ');
  return `${excerpt.slice(0, boundary > 0 ? boundary : maxLength - 3)}...`;
};

export const resolveMetadataImage = (
  candidate: string | null | undefined | (string | null | undefined)[],
  siteUrl: string,
): string => {
  const isHttpUrl = (value: string): string | null => {
    try {
      const url = new URL(value, siteUrl);
      return /^https?:$/.test(url.protocol) ? url.toString() : null;
    } catch {
      return null;
    }
  };

  const candidates = Array.isArray(candidate) ? candidate : [candidate];
  for (const imageCandidate of candidates) {
    if (!imageCandidate) continue;

    const resolvedCandidate = isHttpUrl(imageCandidate);
    if (resolvedCandidate) return resolvedCandidate;
  }

  return isHttpUrl(DEFAULT_METADATA.defaultImage.url)!;
};

export const compact = (obj: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v != null),
  );
