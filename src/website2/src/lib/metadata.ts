import { Metadata, Viewport } from 'next';

// Type definitions for better type safety
interface ImageMetadata {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  type?: string;
}

interface MetadataConfig {
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

interface DomainConfig {
  domain: string;
  protocol: 'https';
  www: boolean;
}

// Constants for domain configuration
const DOMAIN_CONFIGS: DomainConfig[] = [
  { domain: 'airqo.net', protocol: 'https', www: false },
  { domain: 'airqo.net', protocol: 'https', www: true },
  { domain: 'airqo.africa', protocol: 'https', www: false },
  { domain: 'airqo.africa', protocol: 'https', www: true },
  { domain: 'airqo.org', protocol: 'https', www: false },
  { domain: 'airqo.org', protocol: 'https', www: true },
  { domain: 'airqo.mak.ac.ug', protocol: 'https', www: false },
  { domain: 'airqo.mak.ac.ug', protocol: 'https', www: true },
];

// Generate supported domains from configs
const SUPPORTED_DOMAINS = DOMAIN_CONFIGS.map(
  (config) =>
    `${config.protocol}://${config.www ? 'www.' : ''}${config.domain}`,
);

// Primary domains for fallback (without www)
const PRIMARY_DOMAINS = [
  'https://airqo.net',
  'https://airqo.africa',
  'https://airqo.org',
  'https://airqo.mak.ac.ug',
];

// Cache for domain detection to avoid repeated calculations
let cachedDomain: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minute cache

// Default metadata configuration
const DEFAULT_METADATA = {
  siteName: 'AirQo - Air Quality Monitoring Network Africa',
  siteUrl: 'https://airqo.net', // Default fallback
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

// Utility: remove empty or falsy entries from an object (shallow)
const compact = (obj: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v != null),
  );

// Enhanced logging utilities with environment checks
const isDev = process.env.NODE_ENV === 'development';
const isDebugMode = process.env.NEXT_PUBLIC_DEBUG_METADATA === 'true';

const logDebug = (...args: any[]): void => {
  if (isDev && isDebugMode) {
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
const isValidDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
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
const sanitizeUrl = (url: string): string => {
  try {
    // Remove trailing slashes and normalize
    const normalized = url.replace(/\/+$/, '');

    // Validate against our domains
    if (!isValidDomain(normalized)) {
      logWarn(`URL not from supported domain: ${normalized}`);
      return PRIMARY_DOMAINS[0]; // Fallback to primary
    }

    return normalized;
  } catch (error) {
    logError('URL sanitization failed:', error);
    return PRIMARY_DOMAINS[0];
  }
};

/**
 * Enhanced domain detection with multiple methods and caching
 * Implements fail-safe mechanisms and performance optimizations
 */
const getCurrentDomain = (): string => {
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
    const envUrls = [
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.NEXT_PUBLIC_DOMAIN,
      process.env.SITE_URL,
      process.env.DOMAIN,
    ].filter(Boolean);

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
      process.env.NEXT_PUBLIC_VERCEL_URL,
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

  // Method 4: Headers detection (for server-side rendering)
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

  // Fallback to primary domain
  if (!detectedDomain) {
    detectedDomain = PRIMARY_DOMAINS[0];
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
  const detectedDomain = getCurrentDomain();

  // For social media, prefer main recognizable domains
  if (context === 'social') {
    try {
      const hostname = new URL(detectedDomain).hostname;

      // Prefer non-www versions for cleaner social sharing
      if (hostname.includes('airqo.net')) return 'https://airqo.net';
      if (hostname.includes('airqo.africa')) return 'https://airqo.africa';
      if (hostname.includes('airqo.org')) return 'https://airqo.org';
      if (hostname.includes('airqo.mak.ac.ug'))
        return 'https://airqo.mak.ac.ug';
    } catch (error) {
      logError('Social domain context failed:', error);
    }
  }

  // For API contexts, might want specific domain
  if (context === 'api') {
    // Could implement API-specific domain logic here if needed
    return detectedDomain;
  }

  return detectedDomain;
};

/**
 * Generate viewport configuration separately (Next.js 14.2+ requirement)
 * @returns Viewport configuration object
 */
export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  };
}

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

  // Note: structured JSON-LD should be rendered as a <script type="application/ld+json"> in the
  // page/layout (server component). We intentionally don't inject JSON-LD in `other` because
  // Next's metadata `other` maps to <meta> tags. If you need JSON-LD, render it in `app/layout.tsx`.

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
        'en-UG': fullUrl, // Uganda English
        'en-KE': fullUrl, // Kenya English
        'en-NG': fullUrl, // Nigeria English
        'en-ZA': fullUrl, // South Africa English
        'en-GH': fullUrl, // Ghana English
        'en-RW': fullUrl, // Rwanda English
        'en-TZ': fullUrl, // Tanzania English
        'sw-KE': fullUrl, // Swahili Kenya
        'sw-TZ': fullUrl, // Swahili Tanzania
        'sw-UG': fullUrl, // Swahili Uganda
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
          secureUrl: image.url, // Ensure HTTPS
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
      // siteId/creatorId can be added if available
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
      // Facebook specific
      'fb:app_id': process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
      'fb:pages': process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID || '',

      // LinkedIn specific
      'article:publisher': 'https://www.linkedin.com/company/airqo/',

      // Pinterest
      'p:domain_verify': process.env.NEXT_PUBLIC_PINTEREST_DOMAIN_VERIFY || '',

      // Twitter additional
      'twitter:domain': socialDomain.replace('https://', ''),
      'twitter:url': socialUrl,

      // Apple specific
      'apple-mobile-web-app-title': 'AirQo',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-touch-icon': '/apple-touch-icon.png',

      // Microsoft specific
      'msapplication-TileColor': DEFAULT_METADATA.themeColor,
      'msapplication-TileImage': '/mstile-144x144.png',
      'msapplication-config': '/browserconfig.xml',

      // PWA and mobile
      'theme-color': DEFAULT_METADATA.themeColor,
      'mobile-web-app-capable': 'yes',
      'application-name': 'AirQo',

      // Additional SEO / verification
      'google-site-verification':
        process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
      'yandex-verification': process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || '',
      'bing-verification': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',

      // Content Security
      referrer: 'origin-when-cross-origin',
      'format-detection': 'telephone=no',

      // Never expose debug info in metadata tags
    }),

    // Verification tokens
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      me: process.env.NEXT_PUBLIC_WEBMASTER_VERIFICATION,
    },

    // App links for mobile apps
    appLinks: {
      ios: {
        url: fullUrl,
        app_store_id: process.env.NEXT_PUBLIC_IOS_APP_ID || '',
        app_name: 'AirQo',
      },
      android: {
        package: process.env.NEXT_PUBLIC_ANDROID_PACKAGE || 'com.airqo.app',
        app_name: 'AirQo',
        url: fullUrl,
      },
      web: {
        url: fullUrl,
        should_fallback: true,
      },
    },

    // Additional metadata
    metadataBase: new URL(canonicalDomain),
    category: 'Environment',
    classification: 'Air Quality Monitoring',
  };
}

// Page-specific metadata configurations with enhanced SEO
export const METADATA_CONFIGS = {
  home: {
    title:
      'AirQo | Air Quality Monitoring Uganda, Kenya, Nigeria - Real-time Pollution Data Africa',
    description:
      'Leading air quality monitoring network across Africa. Real-time PM2.5 data from 200+ sensors in Kampala, Nairobi, Lagos, Accra. Track pollution levels in Uganda, Kenya, Nigeria, Ghana, Rwanda, Tanzania. Free mobile app & API access. Partner: Google.org, World Bank.',
    keywords:
      'air quality Uganda, air pollution Kenya, Nigeria air quality monitoring, Ghana pollution data, Kampala air quality, Nairobi pollution, Lagos air quality, Accra PM2.5, air quality Africa, African cities pollution, Uganda pollution monitoring, Kenya air sensors, Nigeria environmental data, Ghana air quality, Rwanda air monitoring, Tanzania pollution, Dar es Salaam air quality, Kigali pollution, Jinja air quality, Mombasa pollution, Kisumu air quality, Entebbe pollution data, East Africa air monitoring, West Africa pollution, real-time air quality Africa, low-cost sensors Africa, clean air Africa, AirQo Uganda, AirQo Kenya, AirQo Nigeria, Makerere University air quality, Google.org Africa, WHO air quality Africa',
    url: '/',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
      alt: 'AirQo Air Quality Monitoring - Uganda, Kenya, Nigeria, Ghana Real-time Pollution Data',
      width: 1200,
      height: 630,
      type: 'image/webp',
    },
  },
  about: {
    title:
      'About AirQo | Uganda Air Quality Research - Makerere University Innovation Since 2015',
    description:
      "Founded at Makerere University, Uganda - Africa's #1 air quality monitoring network. Operating in Kampala, Nairobi, Lagos, Accra with 200+ sensors. $4.3M Google.org funding. Serving 60M+ people across Uganda, Kenya, Nigeria, Ghana, Rwanda, Tanzania. Led by Prof. Engineer Bainomugisha.",
    keywords:
      'About AirQo Uganda, Makerere University research, air quality innovation Uganda, Kampala environmental research, AirQo team Kenya, Professor Bainomugisha Uganda, air pollution monitoring Africa, Uganda environmental technology, Kenya air quality research, Nigeria pollution initiative, Ghana clean air, Google.org Africa partnership, World Bank Uganda, EPIC Air Quality Fund Africa, Uganda innovation, East Africa air research, environmental technology Uganda, Kampala innovation hub, African scientists air quality',
    url: '/about-us',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757015506/website/photos/about/teamImage_ganc1y_tyu1ft.webp',
      alt: 'AirQo Team at Makerere University - Leading Air Quality Research in Africa',
      width: 1200,
      height: 630,
      type: 'image/webp',
    },
  },
  monitor: {
    title:
      'AirQo Binos Monitor | Air Quality Sensors Uganda, Kenya, Nigeria - Locally Designed for Africa',
    description:
      "Deploy AirQo's Uganda-designed Binos monitors across Kampala, Nairobi, Lagos, Accra. Built for African climate: dust resistance, tropical weather durability, solar/grid power. Real-time PM2.5, PM10, NO2 monitoring. Proven in 16+ African cities. Made for Uganda, Kenya, Nigeria, Ghana conditions.",
    keywords:
      'AirQo Binos monitor Uganda, air quality sensors Kenya, pollution monitors Nigeria, Ghana air sensors, Kampala air quality monitor, Nairobi pollution sensor, Lagos air monitor, Accra PM2.5 sensor, African climate sensors, Uganda environmental equipment, Kenya pollution devices, tropical weather sensors, dust-resistant monitors Africa, solar powered air sensors, Uganda made monitors, East Africa air sensors, West Africa pollution monitors, low-cost sensors Uganda, Makerere University sensors',
    url: '/products/monitor',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869234/website/photos/OurProducts/Monitor/image15_ua8tyc.jpg',
      alt: 'AirQo Binos Air Quality Monitor - Locally Designed for African Cities',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  analytics: {
    title:
      'Air Quality Analytics | Uganda, Kenya, Nigeria, Ghana Real-time Dashboard - 200+ Monitors',
    description:
      'Track Kampala, Nairobi, Lagos, Accra air quality live. Real-time PM2.5 data from 200+ Uganda, Kenya, Nigeria, Ghana monitors. Historical trends, pollution hotspots, health alerts. Free access to African air quality data. Platform: platform.airqo.net. Coverage: Kampala, Jinja, Entebbe, Nairobi, Mombasa, Kisumu, Lagos, Abuja, Accra.',
    keywords:
      'Kampala air quality dashboard, Nairobi pollution data, Lagos air quality live, Accra PM2.5 tracking, Uganda air quality platform, Kenya pollution dashboard, Nigeria air data, Ghana air monitoring, East Africa air quality data, real-time pollution Uganda, Kampala PM2.5, Nairobi air trends, air quality analytics Uganda, Kenya environmental dashboard, pollution visualization Africa, Jinja air quality, Mombasa pollution, Kisumu air data, African cities air analytics, platform.airqo.net Uganda',
    url: '/products/analytics',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728175853/website/photos/analyticsHome_l3hgcy.png',
      alt: 'AirQo Analytics Platform - Real-time Air Quality Dashboard for Africa',
      width: 1200,
      height: 630,
      type: 'image/png',
    },
  },
  api: {
    title:
      'AirQo API | Open Air Quality Data Access for Developers - Free Tier Available',
    description:
      "Integrate AirQo's comprehensive air quality data into your applications. Access real-time and historical PM2.5, PM10, NO2 data from 200+ monitors across 16+ African cities. RESTful API with documentation, SDKs, and free tier for developers.",
    keywords:
      'AirQo API, air quality API Africa, open air data, developer API, environmental data API, PM2.5 API, pollution data access, RESTful API, air quality SDK, African cities data, real-time air API, historical air data, free API tier, environmental monitoring API',
    url: '/products/api',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1729071534/website/photos/wrapper_zpnvdw.png',
      alt: 'AirQo Developer API - Open Access to African Air Quality Data',
      width: 1200,
      height: 630,
      type: 'image/png',
    },
  },
  mobileApp: {
    title:
      'AirQo App Uganda, Kenya, Nigeria | Free Air Quality Tracker - Kampala, Nairobi, Lagos',
    description:
      'Free air quality app for Uganda, Kenya, Nigeria, Ghana. Track Kampala, Nairobi, Lagos, Accra pollution live. PM2.5 alerts, health tips, daily forecasts. iOS & Android. Know when air is safe in your African city. Protect your family with real-time updates for 16+ African cities.',
    keywords:
      'AirQo app Uganda, air quality app Kenya, pollution app Nigeria, Ghana air app, Kampala air quality app, Nairobi pollution app, Lagos air quality tracker, Accra PM2.5 app, Uganda pollution alerts, Kenya air monitoring app, Nigeria environmental app, East Africa air app, African cities air quality, free air quality app Africa, Uganda health app, Kenya pollution tracker, Android air quality Uganda, iOS pollution app Africa, Jinja air app, Mombasa air quality',
    url: '/products/mobile-app',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742911840/website/photos/OurProducts/MobileApp/Home___Light_mode_aw3ysg.png',
      alt: 'AirQo Mobile App - Air Quality Monitoring in Your Pocket',
      width: 1200,
      height: 630,
      type: 'image/png',
    },
  },
  calibrate: {
    title:
      'AirQalibrate | Advanced Sensor Calibration Platform for Air Quality Networks',
    description:
      'Ensure data accuracy with AirQalibrate - our advanced calibration platform for air quality sensors. Machine learning-based calibration, drift correction, and quality assurance for maintaining reliable air quality monitoring networks across Africa.',
    keywords:
      'AirQalibrate, sensor calibration, air quality calibration, data quality assurance, sensor accuracy, ML calibration, drift correction, sensor maintenance, environmental monitoring QA, calibration platform, sensor network management, data validation',
    url: '/products/calibrate',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
      alt: 'AirQalibrate - Advanced Sensor Calibration Platform',
      width: 1200,
      height: 630,
      type: 'image/webp',
    },
  },
  contact: {
    title:
      'Contact AirQo Uganda | Kampala Office - Makerere University | Partner with Us Kenya, Nigeria',
    description:
      'Contact AirQo Kampala office at Makerere University, Uganda. Partnership inquiries for Uganda, Kenya, Nigeria, Ghana projects. Technical support for African sensors. Collaboration with East/West African organizations. Email: info@airqo.net. Office: Makerere University, Kampala, Uganda. Serving Uganda, Kenya, Nigeria.',
    keywords:
      'Contact AirQo Uganda, AirQo Kampala office, Makerere University contact, Uganda air quality support, Kenya partnership AirQo, Nigeria collaboration inquiries, Ghana AirQo contact, Kampala office address, Uganda technical support, East Africa partnerships, AirQo email Uganda, Makerere University Kampala, Uganda environmental organization, Kenya AirQo office, African partnership inquiries',
    url: '/contact',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757015506/website/photos/about/teamImage_ganc1y_tyu1ft.webp',
      alt: 'Contact AirQo Team - Air Quality Experts at Makerere University',
      width: 1200,
      height: 630,
      type: 'image/webp',
    },
  },
  exploreData: {
    title:
      'Uganda, Kenya, Nigeria Air Quality Map | Live PM2.5 Kampala, Nairobi, Lagos - Explore Data',
    description:
      'Interactive air quality map: Kampala, Nairobi, Lagos, Accra, Jinja, Mombasa, Kisumu live PM2.5. 200+ monitors across Uganda, Kenya, Nigeria, Ghana, Rwanda, Tanzania. Real-time pollution data, historical trends, downloadable datasets. Free access to East & West African air quality research data.',
    keywords:
      'Kampala air quality map, Nairobi pollution map, Lagos air quality live, Accra PM2.5 map, Uganda air quality data, Kenya pollution map, Nigeria air monitoring, Ghana air data, Jinja air quality, Mombasa pollution data, Kisumu air map, Entebbe air quality, East Africa pollution map, interactive air map Uganda, real-time air quality Kenya, Uganda environmental data, Kenya air research data, live pollution Uganda, African cities air map, PM2.5 map Africa',
    url: '/explore-data',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
      alt: 'AirQo Interactive Air Quality Map - Explore Data Across Africa',
      width: 1200,
      height: 630,
      type: 'image/png',
    },
  },
  cleanAirForum: {
    title:
      'CLEAN-Air Forum 2025 Nairobi Kenya | Africa Air Quality Conference - Uganda, Nigeria, Ghana Leaders',
    description:
      "Africa's largest air quality conference - Nairobi, Kenya 2025. 500+ experts from Uganda, Kenya, Nigeria, Ghana, Rwanda, Tanzania. Network with African ministers, WHO officials, researchers. Register now. Venue: Nairobi. Participants from Kampala, Lagos, Accra, Kigali, Dar es Salaam. Africa's clean air future.",
    keywords:
      'CLEAN-Air Forum Nairobi, Kenya air quality conference, Nairobi environmental summit 2025, East Africa air conference, Uganda air quality forum, Kenya environmental leaders, Nigeria clean air summit, Ghana air conference, African ministers environment, Nairobi conference venue, Kampala to Nairobi conference, air quality policy Africa, Kenya climate summit, East Africa environmental forum, African air quality networking, Nairobi 2025 registration',
    url: '/clean-air-forum/about',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Nairobi - Partnerships for Clean Air in Africa',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  // Solutions pages with enhanced SEO
  solutionsAfricanCities: {
    title:
      'Smart City Air Monitoring Uganda, Kenya, Nigeria | Solutions for Kampala, Nairobi, Lagos',
    description:
      'Smart city air quality for African municipalities. Trusted by Kampala, Nairobi, Lagos, Accra city governments. Deploy cost-effective sensors, real-time dashboards, policy-ready data. Help your Uganda, Kenya, Nigeria, Ghana city government make data-driven decisions. Partner with 16+ African cities.',
    keywords:
      'Smart city Kampala, Nairobi smart city air quality, Lagos urban monitoring, Accra city pollution, Uganda municipal air monitoring, Kenya city government solutions, Nigeria urban air quality, Ghana smart city sensors, Kampala city planning, Nairobi urban data, African city governments, Uganda urban planning, Kenya municipal solutions, city air dashboard Uganda, urban environmental Uganda, Jinja city monitoring, Mombasa urban planning',
    url: '/solutions/african-cities',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869234/website/photos/OurProducts/Monitor/image15_ua8tyc.jpg',
      alt: 'Air Quality Solutions for African Smart Cities',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  solutionsCommunities: {
    title:
      'Community Air Quality Uganda, Kenya | Citizen Science Kampala, Nairobi - Grassroots Solutions',
    description:
      'Empower Uganda, Kenya, Nigeria communities with hyperlocal air data. Citizen science programs in Kampala, Nairobi, Lagos neighborhoods. Free tools for community leaders, schools, NGOs. Join 60M+ people in Uganda, Kenya, Nigeria using AirQo data. Environmental justice for African communities.',
    keywords:
      'Community air monitoring Uganda, citizen science Kenya, grassroots Nigeria air quality, community empowerment Uganda, Kampala neighborhood pollution, Nairobi community air data, Lagos local air monitoring, African community science, Uganda environmental justice, Kenya local action, community health Uganda, neighborhood air quality Kenya, participatory monitoring Africa, Uganda community leaders, Kenya NGO air monitoring, African community empowerment',
    url: '/solutions/communities',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132440/website/photos/community/Rectangle_411_toaajz.webp',
      alt: 'Community-Driven Air Quality Monitoring Solutions',
      width: 1200,
      height: 630,
      type: 'image/webp',
    },
  },
  solutionsResearch: {
    title:
      'Air Quality Research Data Uganda, Kenya | Academic API Access - Makerere University',
    description:
      'Free research data: Uganda, Kenya, Nigeria air quality datasets. Makerere University validated data from 200+ monitors. API access for African university researchers. Publications support. Partner institutions: Makerere University Uganda, Nairobi University Kenya, NIMET Nigeria. Advance African air quality science.',
    keywords:
      'Air quality research Uganda, Makerere University data, Kenya academic air data, Nigeria research API, Ghana environmental research, Uganda university air data, African research collaboration, academic datasets Uganda, Kampala research data, Nairobi university data, air quality science Africa, Uganda policy research, Kenya environmental studies, African air quality publications, research API Uganda, Makerere partnerships',
    url: '/solutions/research',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
      alt: 'Air Quality Research Data and Tools for Academia',
      width: 1200,
      height: 630,
      type: 'image/png',
    },
  },
  solutionsNetworkCoverage: {
    title:
      'Network Coverage Map | 400+ Air Quality Monitors Across 14 African Countries - AirQo',
    description:
      "Explore AirQo's network of 400+ real-time air quality monitoring stations across 14 African countries: Uganda (171 monitors), Kenya (105), Nigeria (46), Ghana (12), Gambia (16), South Africa (17), Senegal (3), Zambia (2), Rwanda (1), Mozambique (1), Burundi (8), Cameroon (19), DRC (1), Ethiopia (6). Live PM2.5 measurements from Kampala, Nairobi, Lagos, Accra, Johannesburg and more.",
    keywords:
      'AirQo network coverage, air quality network map Africa, monitoring stations Uganda, monitoring stations Kenya, monitoring stations Nigeria, air quality sensors Ghana, pollution monitors Gambia, air quality South Africa, Rwanda air monitoring, Senegal air quality, Zambia pollution monitors, Mozambique air quality, Burundi air monitoring, Cameroon air quality network, DRC air quality, Ethiopia pollution monitors, Kampala air quality stations, Nairobi monitoring network, Lagos air sensors, Accra air quality monitors, Johannesburg pollution network, 400 air quality monitors, African air quality infrastructure, real-time monitoring sites Africa, air quality coverage map',
    url: '/solutions/network-coverage',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
      alt: 'AirQo Network Coverage Map - 400+ Stations Across 14 African Countries',
      width: 1200,
      height: 630,
      type: 'image/png',
    },
  },
  solutionsKampalaStudy: {
    title:
      'Kampala air pollution exposure study | Join the Clean Air Research - AirQo',
    description:
      'Participate in the Kampala real-time air pollution exposure study. Access real-time air quality data, contribute to clean air research, and help build healthier communities. Join hundreds of Kampala residents making a difference in urban air quality monitoring.',
    keywords:
      'Kampala air quality study, air pollution research Kampala, clean air initiative, citizen science air quality, real-time pollution monitoring, health exposure study, urban air quality research, community participation, environmental health Kampala, AirQo study',
    url: '/solutions/kampala-study',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
      alt: 'Kampala Air Quality Research Study - Real-time Pollution Monitoring',
      width: 1200,
      height: 630,
      type: 'image/webp',
    },
  },
  // Legal pages with proper SEO
  privacyPolicy: {
    title: 'Privacy Policy | AirQo - Data Protection & User Privacy',
    description:
      'AirQo privacy policy outlines how we collect, use, and protect your personal information. Learn about data security, user rights, GDPR compliance, and our commitment to protecting your privacy while providing air quality services.',
    keywords:
      'AirQo privacy policy, data protection, GDPR compliance, user privacy, personal data security, privacy rights, data collection policy, information security',
    url: '/legal/privacy-policy',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869234/website/photos/OurProducts/Monitor/image15_ua8tyc.jpg',
      alt: 'AirQo Privacy Policy and Data Protection',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  termsOfService: {
    title: 'Terms of Service | AirQo Platform Usage Agreement',
    description:
      "Read AirQo's terms of service for using our air quality monitoring platform, mobile app, API, and data services. Understand usage rights, limitations, and responsibilities for accessing African air quality data.",
    keywords:
      'AirQo terms of service, usage agreement, platform terms, service conditions, API terms, data usage rights, legal terms, user agreement',
    url: '/legal/terms-of-service',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869234/website/photos/OurProducts/Monitor/image15_ua8tyc.jpg',
      alt: 'AirQo Terms of Service',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  paymentRefundPolicy: {
    title: 'Payment & Refund Policy | AirQo Services Billing Terms',
    description:
      "Understand AirQo's payment processing, billing cycles, and refund policies for premium services, API access, and monitoring solutions. Clear terms for transactions and dispute resolution.",
    keywords:
      'AirQo payment policy, refund terms, billing policy, payment processing, transaction terms, refund process, service billing',
    url: '/legal/payment-refund-policy',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869234/website/photos/OurProducts/Monitor/image15_ua8tyc.jpg',
      alt: 'AirQo Payment and Refund Policies',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  airqoDataPolicy: {
    title:
      'AirQo Open Data Policy | Creative Commons License & Usage Guidelines',
    description:
      "Access AirQo's open air quality data under Creative Commons license. Learn about data usage rights, attribution requirements, API access terms, and how researchers and developers can leverage our environmental data for impact.",
    keywords:
      'AirQo open data, Creative Commons license, data usage policy, open data access, attribution requirements, research data rights, API licensing, environmental data sharing',
    url: '/legal/airqo-data',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
      alt: 'AirQo Open Data Policy and Licensing',
      width: 1200,
      height: 630,
      type: 'image/png',
    },
  },
  // CLEAN-Air Forum pages with event-specific SEO
  cleanAirForumSessions: {
    title: 'Sessions & Agenda | CLEAN-Air Forum 2025 Nairobi - 3-Day Program',
    description:
      'Explore 50+ sessions at CLEAN-Air Forum 2025 including keynotes, panel discussions, workshops, and networking events. Topics cover air quality monitoring, policy frameworks, health impacts, and clean air solutions for African cities.',
    keywords:
      'CLEAN-Air Forum agenda, conference sessions, air quality workshops, Nairobi 2025 program, environmental panels, policy discussions, technical workshops, networking events',
    url: '/clean-air-forum/clean-air-forum-2025/sessions',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Conference Sessions',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumSpeakers: {
    title:
      'Speakers & Experts | CLEAN-Air Forum 2025 - 100+ Environmental Leaders',
    description:
      'Meet 100+ distinguished speakers at CLEAN-Air Forum 2025 including government ministers, WHO officials, researchers, and innovators. Leading voices in air quality science, policy, and technology sharing insights on African air pollution solutions.',
    keywords:
      'CLEAN-Air Forum speakers, air quality experts, environmental leaders, conference presenters, WHO officials, African ministers, research scientists, policy makers',
    url: '/clean-air-forum/clean-air-forum-2025/speakers',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Distinguished Speakers',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumResources: {
    title: 'Resources & Materials | CLEAN-Air Forum 2025 - Download Center',
    description:
      'Access presentations, research papers, policy briefs, and tools from CLEAN-Air Forum 2025. Download air quality datasets, monitoring guides, implementation frameworks, and best practices for clean air initiatives in African cities.',
    keywords:
      'CLEAN-Air Forum resources, conference materials, research downloads, policy documents, air quality tools, presentation slides, implementation guides, best practices',
    url: '/clean-air-forum/clean-air-forum-2025/resources',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Resources and Downloads',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumSponsorships: {
    title: 'Sponsorship Opportunities | CLEAN-Air Forum 2025 - Partner with Us',
    description:
      'Partner with CLEAN-Air Forum 2025 to showcase your commitment to clean air in Africa. Sponsorship packages include exhibition space, speaking opportunities, branding, and networking with 500+ environmental leaders and decision-makers.',
    keywords:
      'CLEAN-Air Forum sponsorship, partnership opportunities, conference sponsors, exhibition packages, environmental partnerships, corporate sponsorship, event partnership',
    url: '/clean-air-forum/clean-air-forum-2025/sponsorships',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Sponsorship Opportunities',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumLogistics: {
    title:
      'Venue & Travel Info | CLEAN-Air Forum 2025 Nairobi - Plan Your Visit',
    description:
      'Plan your trip to CLEAN-Air Forum 2025 in Nairobi, Kenya. Find venue details, recommended hotels, visa information, local transportation, and travel tips. Special rates available at partner hotels near the conference center.',
    keywords:
      'CLEAN-Air Forum venue, Nairobi conference location, travel Kenya, conference hotels, visa information, airport transfers, accommodation Nairobi, travel logistics',
    url: '/clean-air-forum/clean-air-forum-2025/logistics',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Venue in Nairobi',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumProgramCommittee: {
    title: 'Program Committee | CLEAN-Air Forum 2025 Organizing Team',
    description:
      'Meet the distinguished program committee organizing CLEAN-Air Forum 2025. Leading researchers, policymakers, and practitioners from WHO, UNEP, African governments, and academia shaping the conference agenda for maximum impact.',
    keywords:
      'CLEAN-Air Forum committee, conference organizers, program committee, scientific committee, organizing team, conference leadership, advisory board',
    url: '/clean-air-forum/clean-air-forum-2025/program-committee',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Program Committee',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumGlossary: {
    title:
      'Air Quality Glossary | CLEAN-Air Forum 2025 - Key Terms & Definitions',
    description:
      'Comprehensive glossary of air quality terms, monitoring technologies, and policy concepts. Understand PM2.5, PM10, AQI, WHO guidelines, and technical terminology used in air pollution science and clean air initiatives.',
    keywords:
      'Air quality glossary, PM2.5 definition, AQI explained, air pollution terms, monitoring terminology, WHO guidelines, environmental definitions, technical glossary',
    url: '/clean-air-forum/clean-air-forum-2025/glossary',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'Air Quality Terms and Definitions Glossary',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  cleanAirForumPartners: {
    title:
      'Partners & Collaborators | CLEAN-Air Forum 2025 - Global Support Network',
    description:
      'CLEAN-Air Forum 2025 partners include WHO, UNEP, World Bank, Google.org, African governments, and leading environmental organizations. Together advancing clean air solutions through collaboration and knowledge sharing.',
    keywords:
      'CLEAN-Air Forum partners, conference collaborators, WHO partnership, UNEP support, World Bank, Google.org, environmental partners, African organizations',
    url: '/clean-air-forum/clean-air-forum-2025/partners',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Partners and Collaborators',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  careers: {
    title:
      'Jobs at AirQo Uganda | Environmental Careers Kampala - Data Science, Engineering Jobs Kenya',
    description:
      "Join AirQo's team in Kampala, Uganda and Nairobi, Kenya. 50+ professionals combating African air pollution. Open positions: data science, engineering, research, community engagement. Work from Kampala office or remote across Uganda, Kenya, Nigeria. Competitive Uganda salaries, international benefits. Impact 60M+ Africans.",
    keywords:
      'AirQo jobs Uganda, environmental careers Kampala, data science jobs Uganda, engineering careers Kenya, Nairobi environmental jobs, Uganda tech careers, remote jobs Uganda, Makerere University careers, Kampala NGO jobs, Kenya data science, Uganda research positions, environmental jobs East Africa, air quality careers Africa, impact jobs Uganda, sustainability careers Kampala, Uganda tech jobs, Kenya engineering jobs',
    url: '/careers',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728310706/website/photos/about/careerImage_t91yzh.png',
      alt: 'Join AirQo Team - Environmental Careers in Africa',
      width: 1200,
      height: 630,
      type: 'image/png',
    },
  },
  events: {
    title:
      'Events & Conferences | AirQo Air Quality Workshops & Community Engagement',
    description:
      'Stay updated with AirQo events including CLEAN-Air Forum, community workshops, hackathons, training sessions, and webinars. Join us at conferences across Africa to learn about air quality monitoring and clean air solutions.',
    keywords:
      'AirQo events, air quality conferences, environmental workshops, community events, hackathons, training sessions, webinars, African environmental events',
    url: '/events',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/section1_usfuoj.webp',
      alt: 'AirQo Events and Conferences',
      width: 1200,
      height: 630,
      type: 'image/webp',
    },
  },
  press: {
    title: 'Press & Media Coverage | AirQo in the News - Media Resources',
    description:
      'Access AirQo press releases, media coverage, and journalist resources. Featured in CNN, BBC, Reuters, and leading African media. Download press kits, high-resolution images, and expert quotes on air quality in Africa.',
    keywords:
      'AirQo press, media coverage, press releases, journalist resources, news coverage, media kit, expert quotes, air quality news, environmental journalism Africa',
    url: '/press',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757015506/website/photos/about/teamImage_ganc1y_tyu1ft.webp',
      alt: 'AirQo Press and Media Resources',
      width: 1200,
      height: 630,
      type: 'image/webp',
    },
  },
  resources: {
    title: 'Resources & Publications | AirQo Research Papers, Reports & Guides',
    description:
      "Access AirQo's library of 50+ research publications, technical reports, policy briefs, and educational materials. Download air quality datasets, monitoring guides, and case studies from our work across 16+ African cities.",
    keywords:
      'AirQo resources, research publications, air quality reports, technical guides, policy briefs, educational materials, case studies, datasets, monitoring guides',
    url: '/resources',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
      alt: 'AirQo Resources and Publications Library',
      width: 1200,
      height: 630,
      type: 'image/webp',
    },
  },
  faqs: {
    title:
      'FAQs | Frequently Asked Questions About AirQo Air Quality Monitoring',
    description:
      'Find answers to common questions about AirQo sensors, data access, mobile app, API usage, partnerships, and air quality basics. Learn how to interpret PM2.5 readings, access our data, and collaborate with us.',
    keywords:
      'AirQo FAQ, frequently asked questions, air quality help, sensor questions, data access FAQ, API documentation, PM2.5 explained, partnership inquiries',
    url: '/faqs',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
      alt: 'AirQo Frequently Asked Questions',
      width: 1200,
      height: 630,
      type: 'image/webp',
    },
  },
  partners: {
    title:
      'Partners & Collaborators | Google.org, World Bank, WHO & More - AirQo',
    description:
      "Meet AirQo's strategic partners including Google.org ($4.3M AI Impact Challenge), World Bank, WHO, UNEP, and 20+ organizations. Together we're scaling air quality monitoring to protect 60+ million people across Africa.",
    keywords:
      'AirQo partners, Google.org partnership, World Bank collaboration, WHO partnership, UNEP, environmental partnerships, African collaborations, strategic partners, funding partners',
    url: '/partners',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757015506/website/photos/about/teamImage_ganc1y_tyu1ft.webp',
      alt: 'AirQo Strategic Partners and Collaborators',
      width: 1200,
      height: 630,
      type: 'image/webp',
    },
  },
  // Country-specific landing pages for African traffic
  ugandaAirQuality: {
    title:
      'Air Quality Uganda 2026 | Kampala, Jinja, Entebbe PM2.5 Live - AirQo Real-time Monitoring',
    description:
      'Uganda air quality monitoring live. Track PM2.5, PM10 in Kampala, Jinja, Entebbe, Mbarara, Gulu. Real-time pollution data from 100+ monitors nationwide. Free AirQo app for Ugandans. Know your air - Makerere University research protecting 40M+ Ugandans. Daily forecasts, health alerts.',
    keywords:
      'air quality Uganda, Kampala air pollution, Uganda PM2.5, Jinja air quality, Entebbe pollution, Kampala pollution levels, Uganda environmental data, air quality monitoring Uganda, Kampala air today, Uganda pollution map, Mbarara air quality, Gulu pollution, Kampala smog, Uganda air index, real-time air Uganda, Kampala air quality today, pollution Uganda cities, Uganda air quality app, Makerere air quality, Uganda air health',
    url: '/uganda-air-quality',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
      alt: 'Uganda Air Quality Map - Kampala, Jinja, Entebbe Real-time PM2.5',
      width: 1200,
      height: 630,
      type: 'image/png',
    },
  },
  kenyaAirQuality: {
    title:
      'Air Quality Kenya 2026 | Nairobi, Mombasa, Kisumu PM2.5 Live - Real-time Pollution Monitoring',
    description:
      'Kenya air quality live monitoring. Track Nairobi, Mombasa, Kisumu, Nakuru pollution. Real-time PM2.5 data from 80+ monitors. Free mobile app for Kenyans. AirQo protecting 50M+ Kenyans with accurate air quality data. Health recommendations, daily forecasts for Kenya cities.',
    keywords:
      'air quality Kenya, Nairobi air pollution, Kenya PM2.5, Mombasa air quality, Kisumu pollution, Nairobi pollution levels, Kenya environmental data, air quality monitoring Kenya, Nairobi air today, Kenya pollution map, Nakuru air quality, Eldoret pollution, Nairobi smog, Kenya air index, real-time air Kenya, Nairobi air quality today, pollution Kenya cities, Kenya air quality app, Nairobi air health',
    url: '/kenya-air-quality',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
      alt: 'Kenya Air Quality Map - Nairobi, Mombasa, Kisumu Real-time PM2.5',
      width: 1200,
      height: 630,
      type: 'image/png',
    },
  },
  nigeriaAirQuality: {
    title:
      'Air Quality Nigeria 2026 | Lagos, Abuja, Port Harcourt PM2.5 - Real-time Pollution Data',
    description:
      'Nigeria air quality monitoring live. Track Lagos, Abuja, Port Harcourt, Kano pollution. Real-time PM2.5 from 50+ monitors. Free AirQo app for Nigerians. Protecting 200M+ Nigerians with accurate air data. Health alerts for Nigerian cities. Know your air today.',
    keywords:
      'air quality Nigeria, Lagos air pollution, Nigeria PM2.5, Abuja air quality, Port Harcourt pollution, Lagos pollution levels, Nigeria environmental data, air quality monitoring Nigeria, Lagos air today, Nigeria pollution map, Kano air quality, Ibadan pollution, Lagos smog, Nigeria air index, real-time air Nigeria, Lagos air quality today, pollution Nigeria cities, Nigeria air quality app, Lagos air health',
    url: '/nigeria-air-quality',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
      alt: 'Nigeria Air Quality Map - Lagos, Abuja, Port Harcourt PM2.5',
      width: 1200,
      height: 630,
      type: 'image/png',
    },
  },
  ghanaAirQuality: {
    title:
      'Air Quality Ghana 2026 | Accra, Kumasi PM2.5 Live - Real-time Pollution Monitoring Ghana',
    description:
      'Ghana air quality monitoring. Track Accra, Kumasi, Takoradi pollution live. Real-time PM2.5 data from 40+ monitors nationwide. Free AirQo mobile app for Ghanaians. Protecting 30M+ Ghanaians with accurate air quality information. Daily forecasts, health tips for Ghana cities.',
    keywords:
      'air quality Ghana, Accra air pollution, Ghana PM2.5, Kumasi air quality, Takoradi pollution, Accra pollution levels, Ghana environmental data, air quality monitoring Ghana, Accra air today, Ghana pollution map, Kumasi pollution levels, Accra smog, Ghana air index, real-time air Ghana, Accra air quality today, pollution Ghana cities, Ghana air quality app, Accra air health',
    url: '/ghana-air-quality',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
      alt: 'Ghana Air Quality Map - Accra, Kumasi Real-time PM2.5',
      width: 1200,
      height: 630,
      type: 'image/png',
    },
  },
  rwandaAirQuality: {
    title:
      'Air Quality Rwanda 2026 | Kigali PM2.5 Live - Real-time Pollution Monitoring Rwanda',
    description:
      'Rwanda air quality monitoring. Track Kigali pollution live with real-time PM2.5 data. Free AirQo app for Rwandans. Accurate air quality information protecting 13M+ Rwandans. Daily forecasts and health recommendations for Kigali and Rwanda cities.',
    keywords:
      'air quality Rwanda, Kigali air pollution, Rwanda PM2.5, Kigali air quality, Rwanda pollution levels, Rwanda environmental data, air quality monitoring Rwanda, Kigali air today, Rwanda pollution map, Kigali pollution levels, Rwanda air index, real-time air Rwanda, Kigali air quality today, Rwanda air quality app',
    url: '/rwanda-air-quality',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
      alt: 'Rwanda Air Quality Map - Kigali Real-time PM2.5',
      width: 1200,
      height: 630,
      type: 'image/png',
    },
  },
  tanzaniaAirQuality: {
    title:
      'Air Quality Tanzania 2026 | Dar es Salaam, Arusha PM2.5 - Real-time Pollution Monitoring',
    description:
      'Tanzania air quality live monitoring. Track Dar es Salaam, Arusha, Mwanza pollution. Real-time PM2.5 data. Free AirQo app for Tanzanians. Protecting 60M+ Tanzanians with accurate air quality information. Daily forecasts for Tanzania cities.',
    keywords:
      'air quality Tanzania, Dar es Salaam air pollution, Tanzania PM2.5, Arusha air quality, Mwanza pollution, Dar es Salaam pollution levels, Tanzania environmental data, air quality monitoring Tanzania, Dar es Salaam air today, Tanzania pollution map, Tanzania air index, real-time air Tanzania, Tanzania air quality app',
    url: '/tanzania-air-quality',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
      alt: 'Tanzania Air Quality Map - Dar es Salaam Real-time PM2.5',
      width: 1200,
      height: 630,
      type: 'image/png',
    },
  },
} as const;

// Type guard for metadata configs
export type MetadataConfigKey = keyof typeof METADATA_CONFIGS;

/**
 * Helper function to get metadata config with validation
 * @param key - The metadata config key
 * @returns The metadata configuration or null if not found
 */
export function getMetadataConfig(
  key: MetadataConfigKey,
): MetadataConfig | null {
  if (key in METADATA_CONFIGS) {
    return METADATA_CONFIGS[key];
  }
  logWarn(`Metadata config not found for key: ${key}`);
  return null;
}

/**
 * Generate metadata for a specific page
 * @param page - The page key from METADATA_CONFIGS
 * @returns Generated metadata object
 */
export function getPageMetadata(page: MetadataConfigKey): Metadata {
  const config = getMetadataConfig(page);
  if (!config) {
    logError(`No metadata config found for page: ${page}`);
    // Return default metadata as fallback
    return generateMetadata(METADATA_CONFIGS.home);
  }
  return generateMetadata(config);
}

// Export utility functions for external use
export const metadataUtils = {
  getCurrentDomain,
  getDomainForContext,
  sanitizeUrl,
  isValidDomain,
  generateMetadata,
  generateViewport,
  getMetadataConfig,
  getPageMetadata,
} as const;

// Export types for TypeScript support
export type { DomainConfig, ImageMetadata, MetadataConfig };
