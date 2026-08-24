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
  const base = siteUrl.replace(/\/+$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AirQo',
    description: 'Air Quality Monitoring Network Africa',
    url: base,
    image: DEFAULT_METADATA.defaultImage.url,
    publisher: {
      '@type': 'Organization',
      name: 'AirQo',
      logo: {
        '@type': 'ImageObject',
        url: `${base}/apple-touch-icon.png`,
      },
    },
  };
}

export function generateWebPageSchema(
  config: MetadataConfig,
  siteUrl: string,
): StructuredData {
  const base = siteUrl.replace(/\/+$/, '');
  const url = config.url.startsWith('http')
    ? config.url
    : `${base}${config.url}`;

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
        url: `${base}/apple-touch-icon.png`,
      },
    },
  };
}

export function generateWebsiteSchema(siteUrl: string): StructuredData {
  const base = siteUrl.replace(/\/+$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DEFAULT_METADATA.siteName,
    description: 'Leading air quality monitoring network across Africa',
    url: base,
    image: DEFAULT_METADATA.defaultImage.url,
  };
}

interface ProductStructuredData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  image?: string;
  brand: {
    '@type': string;
    name: string;
  };
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
    availability: string;
  };
}

/**
 * Extract a display name from a page title by dropping the SEO suffix
 * after the first "|" separator (e.g. "AirQo Vertex | Open Data Platform"
 * -> "AirQo Vertex").
 */
export function getProductDisplayName(title: string): string {
  return title.split('|')[0]?.trim() ?? title.trim();
}

export function generateProductSchema(
  config: MetadataConfig,
  siteUrl: string,
): ProductStructuredData {
  const base = siteUrl.replace(/\/+$/, '');
  const image = config.image || DEFAULT_METADATA.defaultImage;
  const imageUrl = image.url.startsWith('http')
    ? image.url
    : `${base}${image.url}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: getProductDisplayName(config.title),
    description: config.description,
    image: imageUrl,
    brand: {
      '@type': 'Brand',
      name: 'AirQo',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbListStructuredData {
  '@context': string;
  '@type': string;
  itemListElement: {
    '@type': string;
    position: number;
    name: string;
    item: string;
  }[];
}

export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
  siteUrl: string,
): BreadcrumbListStructuredData {
  const base = siteUrl.replace(/\/+$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${base}${item.url}`,
    })),
  };
}
