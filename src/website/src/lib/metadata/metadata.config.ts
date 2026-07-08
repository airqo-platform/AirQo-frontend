import { getConfiguredSiteUrls, getPrimarySiteUrl } from '../siteUrl';

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

export const SUPPORTED_DOMAINS = getConfiguredSiteUrls();
export const PRIMARY_SITE_URL = getPrimarySiteUrl();

export const DEFAULT_METADATA = {
  siteName: 'AirQo - Air Quality Monitoring Network Africa',
  siteUrl: PRIMARY_SITE_URL,
  defaultImage: {
    url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
    alt: 'AirQo - Clean Air for All African Cities | Real-time Air Quality Monitoring',
    width: 1200,
    height: 630,
    type: 'image/webp',
  },
  twitterHandle: '@AirQoProject',
  locale: 'en_US',
  themeColor: '#145DFF',
} as const;

export const compact = (obj: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v != null),
  );
