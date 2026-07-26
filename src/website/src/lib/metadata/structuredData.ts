import { DEFAULT_METADATA, MetadataConfig } from './metadata.config';

interface StructuredData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  image?: string;
  publisher?: {
    '@type': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
}

export function generateOrganizationSchema(siteUrl: string): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AirQo',
    description: 'Air Quality Monitoring Network Africa',
    url: siteUrl,
    image: DEFAULT_METADATA.defaultImage.url,
    publisher: {
      '@type': 'Organization',
      name: 'AirQo',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/apple-touch-icon.png`,
      },
    },
  };
}

export function generateWebPageSchema(
  config: MetadataConfig,
  siteUrl: string,
): StructuredData {
  const url = config.url.startsWith('http')
    ? config.url
    : `${siteUrl}${config.url}`;

  const image = config.image || DEFAULT_METADATA.defaultImage;

  return {
    '@context': 'https://schema.org',
    '@type': config.type === 'article' ? 'Article' : 'WebPage',
    name: config.title,
    description: config.description,
    url,
    image: image.url,
    publisher: {
      '@type': 'Organization',
      name: 'AirQo',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/apple-touch-icon.png`,
      },
    },
  };
}

export function generateWebsiteSchema(siteUrl: string): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DEFAULT_METADATA.siteName,
    description: 'Leading air quality monitoring network across Africa',
    url: siteUrl,
    image: DEFAULT_METADATA.defaultImage.url,
  };
}
