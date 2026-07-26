import { Metadata } from 'next';

import { getPrimarySiteUrl } from '../siteUrl';
import { compact, DEFAULT_METADATA, MetadataConfig } from './metadata.config';

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

  const image = config.image || DEFAULT_METADATA.defaultImage;
  const siteUrl = getPrimarySiteUrl(hostHeader);

  const fullUrl = config.url.startsWith('http')
    ? config.url
    : `${siteUrl}${config.url}`;

  const socialUrl = fullUrl;

  const socialDomain = siteUrl.replace('https://', '');

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    authors: [
      { name: 'AirQo' },
      { name: 'Makerere University', url: 'https://mak.ac.ug' },
    ],
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
      languages: {
        'en-US': fullUrl,
        'en-GB': fullUrl,
        'en-UG': fullUrl,
        'en-KE': fullUrl,
        'en-NG': fullUrl,
        'en-ZA': fullUrl,
        'en-GH': fullUrl,
        'en-RW': fullUrl,
        'en-TZ': fullUrl,
        'sw-KE': fullUrl,
        'sw-TZ': fullUrl,
        'sw-UG': fullUrl,
        'x-default': fullUrl,
      },
    },

    openGraph: {
      type: config.type || 'website',
      url: socialUrl,
      title: config.title,
      description: config.description,
      siteName: DEFAULT_METADATA.siteName,
      locale: DEFAULT_METADATA.locale,
      alternateLocale: [
        'en_GB',
        'en_UG',
        'en_KE',
        'en_NG',
        'en_GH',
        'en_RW',
        'en_TZ',
        'sw_KE',
        'sw_TZ',
      ],
      images: [
        {
          url: image.url,
          width: image.width || DEFAULT_METADATA.defaultImage.width,
          height: image.height || DEFAULT_METADATA.defaultImage.height,
          alt: image.alt,
          type: image.type || DEFAULT_METADATA.defaultImage.type,
          secureUrl: image.url,
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
      description: config.description,
      images: [
        {
          url: image.url,
          alt: image.alt,
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
      'apple-touch-icon': '/apple-touch-icon.png',
      'msapplication-TileColor': DEFAULT_METADATA.themeColor,
      'msapplication-TileImage': '/mstile-144x144.png',
      'msapplication-config': '/browserconfig.xml',
      'theme-color': DEFAULT_METADATA.themeColor,
      'mobile-web-app-capable': 'yes',
      'application-name': 'AirQo',
      referrer: 'origin-when-cross-origin',
      'format-detection': 'telephone=no',
    }),

    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },

    metadataBase: new URL(siteUrl),
    category: 'Environment',
    classification: 'Air Quality Monitoring',
  };
}
