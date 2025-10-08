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
      alternateLocale: ['en_GB', 'en_UG', 'en_KE'],
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
      'AirQo | Bridging the Air Quality Data Gap in Africa - Real-time Monitoring Network',
    description:
      'AirQo empowers African communities with accurate, hyperlocal air quality data through 200+ low-cost sensors across 16+ cities. Access real-time pollution insights where 9 out of 10 people breathe polluted air. Partner with Google.org and World Bank.',
    keywords:
      'AirQo, air quality monitoring Africa, air pollution data, hyperlocal air quality, African cities pollution, real-time air monitoring, low-cost air sensors, clean air Africa, air quality analytics, pollution mitigation, environmental monitoring Africa, PM2.5 monitoring, air quality API, Makerere University, Google.org partner, World Bank air quality',
    url: '/',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
      alt: 'AirQo Air Quality Monitoring Network - 200+ Sensors Across 16+ African Cities',
      width: 1200,
      height: 630,
      type: 'image/webp',
    },
  },
  about: {
    title:
      'About AirQo | Leading Air Quality Innovation in Africa Since 2015 - Makerere University',
    description:
      "Discover AirQo's journey from Makerere University research to Africa's leading air quality network. Learn about our $4.3M Google.org partnership, World Bank collaboration, and impact across 16+ African cities with 200+ monitors providing data access to 60+ million people.",
    keywords:
      'About AirQo, Makerere University AirQo, air quality Africa, AirQo team, Professor Bainomugisha, air pollution monitoring, African environmental initiative, clean air Africa, Google.org AI Impact Challenge, World Bank partnership, EPIC Air Quality Fund, air quality research Africa, environmental innovation Uganda',
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
      'AirQo Binos Monitor | Low-Cost Air Quality Sensors Designed for African Cities',
    description:
      "Deploy AirQo's locally-designed Binos air quality monitors built to withstand African urban conditions. Cost-effective sensors with dust resistance, extreme weather durability, multiple power options, and real-time PM2.5, PM10, NO2 monitoring capabilities.",
    keywords:
      'AirQo Binos monitor, air quality sensors Africa, PM2.5 monitor, PM10 sensor, NO2 monitoring, low-cost air sensors, pollution monitoring devices, African air quality hardware, urban pollution sensors, dust-resistant monitors, weather-proof sensors, air quality IoT devices, environmental monitoring equipment',
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
      'Air Quality Analytics Platform | Real-time Data Dashboard for 16+ African Cities',
    description:
      "Access AirQo's comprehensive analytics platform with real-time and historical air quality data from 200+ monitors across Africa. Visualize PM2.5 trends, pollution hotspots, and air quality insights through our user-friendly dashboard at platform.airqo.net.",
    keywords:
      'AirQo analytics platform, air quality dashboard Africa, real-time air data, PM2.5 visualization, pollution data analytics, environmental monitoring dashboard, air quality insights, platform.airqo.net, African cities air data, air pollution trends, data visualization tools, air quality API access',
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
      'AirQo Mobile App | Real-time Air Quality for African Cities - iOS & Android',
    description:
      'Download the AirQo mobile app for real-time air quality updates, personalized health recommendations, and pollution alerts for African cities. Available on iOS and Android. Track PM2.5 levels, get daily forecasts, and protect your health with actionable insights.',
    keywords:
      'AirQo mobile app, air quality app Africa, pollution monitoring app, PM2.5 tracker, air quality iOS app, air quality Android app, health recommendations, pollution alerts, African cities app, real-time air quality, air quality forecast, environmental health app',
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
      "Contact AirQo | Partner with Africa's Leading Air Quality Network - Get Support",
    description:
      'Contact AirQo for air quality monitoring solutions, research partnerships, or technical support. Connect with our team at Makerere University, Uganda. Email, phone, and office location details for collaboration inquiries.',
    keywords:
      'Contact AirQo, AirQo support, partnership inquiries, Makerere University contact, air quality consultation, technical support, research collaboration, AirQo office Uganda, environmental monitoring support, sensor deployment inquiry',
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
      'Explore Air Quality Data | Interactive Map of 200+ Monitors Across Africa',
    description:
      'Explore real-time air quality across African cities with our interactive map. View live PM2.5 readings from 200+ monitors, analyze historical trends, compare pollution levels, and download datasets for research. Coverage in Uganda, Kenya, Nigeria, Ghana, and more.',
    keywords:
      'Air quality map Africa, real-time pollution data, PM2.5 map, African cities air quality, interactive air quality, pollution explorer, environmental data map, live air monitoring, Uganda air quality, Kenya pollution data, Nigeria air quality, Ghana PM2.5',
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
      "CLEAN-Air Forum 2025 Nairobi | Africa's Premier Air Quality Conference - Register Now",
    description:
      "Join the CLEAN-Air Forum 2025 in Nairobi, Kenya - Africa's leading air quality convening. Network with 500+ experts, policymakers, and innovators. Explore partnerships for clean air solutions, cutting-edge research, and multi-regional collaboration to tackle air pollution.",
    keywords:
      'CLEAN-Air Forum 2025, Nairobi conference, air quality conference Africa, clean air summit, environmental conference Kenya, air pollution solutions, African air quality forum, climate conference 2025, environmental policy forum, air quality partnerships',
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
      'Air Quality Solutions for African Cities | Smart City Monitoring - AirQo',
    description:
      "Transform your city with AirQo's comprehensive air quality monitoring network. Deploy cost-effective sensors, access real-time dashboards, and make data-driven decisions. Trusted by 16+ African cities including Kampala, Lagos, Nairobi, and Accra.",
    keywords:
      'Smart city air quality, African urban monitoring, city pollution solutions, municipal air quality, urban environmental management, city government solutions, smart city sensors, urban planning data, city air quality dashboard, African smart cities',
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
      'Community Air Quality Solutions | Citizen Science & Local Action - AirQo',
    description:
      'Empower communities with hyperlocal air quality data and citizen science tools. AirQo provides accessible monitoring, education programs, and actionable insights to help neighborhoods tackle air pollution. Join 60+ million people accessing our data.',
    keywords:
      'Community air monitoring, citizen science Africa, grassroots environmental action, local air quality, community empowerment, neighborhood pollution, environmental justice, community health data, participatory monitoring, air quality education',
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
      'Air Quality Research Solutions | Academic Data Access & Tools - AirQo',
    description:
      'Access comprehensive air quality datasets for academic research and policy analysis. AirQo provides researchers with validated data from 200+ monitors, API access, collaboration opportunities, and publications support for environmental studies across Africa.',
    keywords:
      'Air quality research data, academic environmental data, research API access, scientific air quality, policy research tools, environmental datasets Africa, research collaboration, academic partnerships, peer-reviewed data, environmental science',
    url: '/solutions/research',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
      alt: 'Air Quality Research Data and Tools for Academia',
      width: 1200,
      height: 630,
      type: 'image/png',
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
      'Careers at AirQo | Environmental Tech Jobs in Africa - Join Our Mission',
    description:
      "Join AirQo's growing team of 50+ professionals working to combat air pollution across Africa. Open positions in data science, engineering, research, community engagement, and policy. Work from Uganda or remotely with competitive benefits.",
    keywords:
      'AirQo careers, environmental jobs Africa, air quality careers, data science jobs, engineering positions, research opportunities, Uganda tech jobs, remote environmental work, impact careers, sustainability jobs',
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
