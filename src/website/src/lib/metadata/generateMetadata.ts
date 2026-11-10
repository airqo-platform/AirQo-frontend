import { Metadata } from 'next';

import { getPrimarySiteUrl } from '../siteUrl';
import {
  cleanMetadataText,
  compact,
  DEFAULT_METADATA,
  MetadataConfig,
  resolveMetadataImage,
} from './metadata.config';

const logError = (...args: any[]): void => {
  console.error('[AirQo Metadata Error]', ...args);
};

/**
 * Generate metadata for a page.
 *
 * @param config - Page-specific metadata configuration
 * @param hostHeader - Optional Host header value for dynamic domain detection.
 *                     Pass this from headers().get('x-forwarded-host') ?? headers().get('host')
 * @returns Next.js Metadata object
 */
export function generateMetadata(
  config: MetadataConfig,
  hostHeader?: string | null,
): Metadata {
  if (!config.title || !config.description || !config.url) {
    logError('Invalid metadata config: missing required fields', config);
    throw new Error('Metadata config must include title, description, and url');
  }

  const siteUrl = getPrimarySiteUrl(hostHeader);
  let fullUrl: string;
  try {
    const resolved = new URL(config.url, siteUrl);
    if (!/^https?:$/.test(resolved.protocol)) {
      throw new Error('Metadata URL must use http or https');
    }
    fullUrl = resolved.toString();
  } catch {
    throw new Error('Metadata URL must be a valid http or https URL');
  }

  const image = config.image || DEFAULT_METADATA.defaultImage;
  const imageUrl = resolveMetadataImage(image.url, siteUrl);
  const description = cleanMetadataText(
    config.description,
    DEFAULT_METADATA.defaultDescription,
  );
  const socialUrl = fullUrl;

  const socialDomain = new URL(siteUrl).host;

  return {
    title: { absolute: config.title },
    description,
    keywords: config.keywords,
    authors: [{ name: 'AirQo' }],
    creator: 'AirQo',
    publisher: 'AirQo',

    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    alternates: {
      canonical: fullUrl,
    },

    openGraph: {
      type: config.type || 'website',
      url: socialUrl,
      title: config.title,
      description,
      siteName: DEFAULT_METADATA.siteName,
      locale: DEFAULT_METADATA.locale,
      images: [
        {
          url: imageUrl,
          width: image.width || DEFAULT_METADATA.defaultImage.width,
          height: image.height || DEFAULT_METADATA.defaultImage.height,
          alt: image.alt || DEFAULT_METADATA.defaultImage.alt,
          type: image.type || DEFAULT_METADATA.defaultImage.type,
          secureUrl: imageUrl,
        },
      ],
      ...(config.publishedTime && { publishedTime: config.publishedTime }),
      ...(config.modifiedTime && { modifiedTime: config.modifiedTime }),
      ...(config.author && { authors: [config.author] }),
      ...(config.section && { section: config.section }),
    },

    twitter: {
      card: 'summary_large_image',
      site: DEFAULT_METADATA.twitterHandle,
      creator: DEFAULT_METADATA.twitterHandle,
      title: config.title,
      description,
      images: [
        {
          url: imageUrl,
          alt: image.alt || DEFAULT_METADATA.defaultImage.alt,
          width: image.width || DEFAULT_METADATA.defaultImage.width,
          height: image.height || DEFAULT_METADATA.defaultImage.height,
        },
      ],
    },

    other: compact({
      'article:publisher': 'https://www.linkedin.com/company/airqo/',
      'twitter:domain': socialDomain,
      'twitter:url': socialUrl,
      'apple-mobile-web-app-title': 'AirQo',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'msapplication-TileColor': DEFAULT_METADATA.themeColor,
      'theme-color': DEFAULT_METADATA.themeColor,
      'mobile-web-app-capable': 'yes',
      'application-name': 'AirQo',
      referrer: 'strict-origin-when-cross-origin',
      'format-detection': 'telephone=no',
    }),

    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },

    metadataBase: new URL(siteUrl),
  };
}
