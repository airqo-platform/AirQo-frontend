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

export function generateOrganizationSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AirQo',
    description: 'Air Quality Monitoring Network Africa',
    url: DEFAULT_METADATA.siteUrl,
    image: DEFAULT_METADATA.defaultImage.url,
    publisher: {
      '@type': 'Organization',
      name: 'AirQo',
      logo: {
        '@type': 'ImageObject',
        url: `${DEFAULT_METADATA.siteUrl}/apple-touch-icon.png`,
      },
    },
  };
}

export function generateWebPageSchema(config: MetadataConfig): StructuredData {
  const url = config.url.startsWith('http')
    ? config.url
    : `${DEFAULT_METADATA.siteUrl}${config.url}`;

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
        url: `${DEFAULT_METADATA.siteUrl}/apple-touch-icon.png`,
      },
    },
  };
}

export function generateWebsiteSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DEFAULT_METADATA.siteName,
    description: 'Leading air quality monitoring network across Africa',
    url: DEFAULT_METADATA.siteUrl,
    image: DEFAULT_METADATA.defaultImage.url,
  };
}
