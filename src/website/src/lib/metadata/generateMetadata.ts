import { Metadata } from 'next';

import {
  compact,
  DEFAULT_METADATA,
  MetadataConfig,
  PRIMARY_SITE_URL,
  SUPPORTED_DOMAINS,
} from './metadata.config';

// Cache for domain detection to avoid repeated calculations
let cachedDomain: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minute cache

// Enhanced logging utilities with environment checks
const isDev = process.env.NODE_ENV === 'development';

const logDebug = (...args: any[]): void => {
  if (isDev) {
    console.log('[AirQo Metadata]', ...args);
  }
};

const logWarn = (...args: any[]): void => {
  if (isDev) {
    console.warn('[AirQo Metadata Warning]', ...args);
  }
};

const logError = (...args: any[]): void => {
  console.error('[AirQo Metadata Error]', ...args);
};

/**
 * Validates if a URL is from a supported domain
 * @param url - URL to validate
 * @returns boolean indicating if URL is valid
 */
export const isValidDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    if (SUPPORTED_DOMAINS.length === 0) {
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    }

    return SUPPORTED_DOMAINS.some((domain) => {
      const domainObj = new URL(domain);
      return urlObj.hostname === domainObj.hostname;
    });
  } catch {
    return false;
  }
};

/**
 * Sanitizes and normalizes URLs
 * @param url - URL to sanitize
 * @returns Sanitized URL string
 */
export const sanitizeUrl = (url: string): string => {
  try {
    // Remove trailing slashes and normalize
    const normalized = url.replace(/\/+$/, '');

    if (SUPPORTED_DOMAINS.length === 0) {
      return normalized;
    }

    // Validate against our domains
    if (!isValidDomain(normalized)) {
      logWarn(`URL not from supported domain: ${normalized}`);
      return PRIMARY_SITE_URL;
    }

    return normalized;
  } catch (error) {
    logError('URL sanitization failed:', error);
    return PRIMARY_SITE_URL;
  }
};

/**
 * Enhanced domain detection with multiple methods and caching
 * Implements fail-safe mechanisms and performance optimizations
 */
export const getCurrentDomain = (): string => {
  // Check cache first
  const now = Date.now();
  if (cachedDomain && now - cacheTimestamp < CACHE_DURATION) {
    return cachedDomain;
  }

  let detectedDomain: string | null = null;

  // Method 1: Client-side detection (browser environment)
  if (typeof window !== 'undefined' && window.location) {
    try {
      const origin = window.location.origin;
      if (origin && isValidDomain(origin)) {
        detectedDomain = sanitizeUrl(origin);
        logDebug('Client-side domain detected:', detectedDomain);
      }
    } catch (error) {
      logWarn('Client-side domain detection failed:', error);
    }
  }

  // Method 2: Environment variable detection
  if (!detectedDomain) {
    const envUrls = SUPPORTED_DOMAINS;

    for (const envUrl of envUrls) {
      if (envUrl) {
        try {
          const normalizedUrl = envUrl.replace(/\/$/, '');
          if (isValidDomain(normalizedUrl)) {
            detectedDomain = sanitizeUrl(normalizedUrl);
            logDebug('Environment domain detected:', detectedDomain);
            break;
          }
        } catch (error) {
          logWarn(`Environment URL parsing failed for ${envUrl}:`, error);
        }
      }
    }
  }

  // Method 3: Platform-specific detection (Vercel, Railway, Render, etc.)
  if (!detectedDomain && typeof process !== 'undefined') {
    const platformVars = [
      process.env.VERCEL_URL,
      process.env.RAILWAY_PUBLIC_DOMAIN,
      process.env.RENDER_EXTERNAL_URL,
    ].filter(Boolean);

    for (const host of platformVars) {
      if (host) {
        try {
          const fullUrl = host.startsWith('http') ? host : `https://${host}`;
          const normalizedUrl = fullUrl.replace(/\/$/, '');

          // Check if it matches our domains
          const hostname = new URL(normalizedUrl).hostname;
          const matchedDomain = SUPPORTED_DOMAINS.find((domain) => {
            return new URL(domain).hostname === hostname;
          });

          if (matchedDomain) {
            detectedDomain = sanitizeUrl(matchedDomain);
            logDebug('Platform domain detected:', detectedDomain);
            break;
          }
        } catch (error) {
          logWarn(`Platform URL parsing failed for ${host}:`, error);
        }
      }
    }
  }

  // Method 4: Header-based detection (for server-side rendering)
  if (!detectedDomain && typeof Headers !== 'undefined') {
    try {
      // Check for host headers in Next.js context
      const headerHost = process.env.HOST || process.env.HOSTNAME;
      if (headerHost) {
        const fullUrl = headerHost.startsWith('http')
          ? headerHost
          : `https://${headerHost}`;
        if (isValidDomain(fullUrl)) {
          detectedDomain = sanitizeUrl(fullUrl);
          logDebug('Header-based domain detected:', detectedDomain);
        }
      }
    } catch (error) {
      logWarn('Header-based domain detection failed:', error);
    }
  }

  // Fallback to the primary configured domain
  if (!detectedDomain) {
    detectedDomain = PRIMARY_SITE_URL;
    logDebug('Using fallback domain:', detectedDomain);
  }

  // Update cache
  cachedDomain = detectedDomain;
  cacheTimestamp = now;

  return detectedDomain;
};

/**
 * Get domain for specific contexts with optimization
 * @param context - The context for which to get the domain
 * @returns Optimized domain URL for the context
 */
export const getDomainForContext = (
  context?: 'social' | 'canonical' | 'api' | 'cdn',
): string => {
  void context;
  return getCurrentDomain();
};

/**
 * Enhanced metadata generation with SEO optimization
 * @param config - Metadata configuration object
 * @returns Next.js Metadata object
 */
export function generateMetadata(config: MetadataConfig): Metadata {
  // Input validation
  if (!config.title || !config.description || !config.url) {
    logError('Invalid metadata config: missing required fields', config);
    throw new Error('Metadata config must include title, description, and url');
  }

  // Use provided image or default
  const image = config.image || DEFAULT_METADATA.defaultImage;

  // Get context-specific domains
  const canonicalDomain = getDomainForContext('canonical');
  const socialDomain = getDomainForContext('social');

  // Build full URLs
  const fullUrl = config.url.startsWith('http')
    ? sanitizeUrl(config.url)
    : `${canonicalDomain}${config.url}`;

  const socialUrl = config.url.startsWith('http')
    ? sanitizeUrl(config.url)
    : `${socialDomain}${config.url}`;

  return {
    // Basic metadata
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    authors: [
      { name: 'AirQo' },
      { name: 'Makerere University', url: 'https://mak.ac.ug' },
    ],
    creator: 'AirQo',
    publisher: 'AirQo',

    // Robots configuration for optimal crawling
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

    // Canonical and alternate URLs
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

    // Open Graph metadata
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

    // Twitter/X metadata
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

    // Additional metadata for enhanced SEO and social sharing
    other: compact({
      'article:publisher': 'https://www.linkedin.com/company/airqo/',
      'twitter:domain': socialDomain.replace('https://', ''),
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

    // Verification tokens
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },

    // Additional metadata
    metadataBase: new URL(canonicalDomain),
    category: 'Environment',
    classification: 'Air Quality Monitoring',
  };
}
