import { DEFAULT_METADATA, MetadataConfig } from './metadata.config';

const absoluteHttpUrl = (candidate: string, baseUrl: string): string => {
  try {
    const resolved = new URL(candidate, baseUrl);
    return /^https?:$/.test(resolved.protocol)
      ? resolved.toString()
      : new URL(DEFAULT_METADATA.defaultImage.url, baseUrl).toString();
  } catch {
    return new URL(DEFAULT_METADATA.defaultImage.url, baseUrl).toString();
  }
};

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
    image: absoluteHttpUrl(DEFAULT_METADATA.defaultImage.url, base),
    publisher: {
      '@type': 'Organization',
      name: 'AirQo',
      logo: {
        '@type': 'ImageObject',
        url: `${base}/web-app-manifest-512x512.png`,
      },
    },
  };
}

export function generateWebPageSchema(
  config: MetadataConfig,
  siteUrl: string,
): StructuredData {
  const base = siteUrl.replace(/\/+$/, '');
  const url = absoluteHttpUrl(config.url, base);

  const image = config.image || DEFAULT_METADATA.defaultImage;

  return {
    '@context': 'https://schema.org',
    '@type': config.type === 'article' ? 'Article' : 'WebPage',
    name: config.title,
    description: config.description,
    url,
    image: absoluteHttpUrl(image.url, base),
    publisher: {
      '@type': 'Organization',
      name: 'AirQo',
      logo: {
        '@type': 'ImageObject',
        url: `${base}/web-app-manifest-512x512.png`,
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
    description: DEFAULT_METADATA.defaultDescription,
    url: base,
    image: absoluteHttpUrl(DEFAULT_METADATA.defaultImage.url, base),
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
  const imageUrl = absoluteHttpUrl(image.url, base);

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
      item: absoluteHttpUrl(item.url, base),
    })),
  };
}
