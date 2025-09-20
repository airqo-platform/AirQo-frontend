import { Metadata } from 'next';

interface MetadataConfig {
  title: string;
  description: string;
  keywords?: string;
  url: string;
  image?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

// All supported AirQo domains
const SUPPORTED_DOMAINS = [
  'https://airqo.net',
  'https://www.airqo.net',
  'https://airqo.africa',
  'https://www.airqo.africa',
  'https://airqo.org',
  'https://www.airqo.org',
  'https://airqo.mak.ac.ug',
  'https://www.airqo.mak.ac.ug',
];

// Primary domains (fallback priority order)
const PRIMARY_DOMAINS = [
  'https://airqo.net',
  'https://airqo.africa',
  'https://airqo.org',
  'https://airqo.mak.ac.ug',
];

/**
 * Enhanced domain detection with multiple methods and proper fallbacks
 * Tries multiple detection methods to ensure the correct domain is used
 */
const isDev = process.env.NODE_ENV === 'development';

const devLog = (...args: any[]) => {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

const devWarn = (...args: any[]) => {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
};

const getCurrentDomain = (): string => {
  // Method 1: Client-side detection (most reliable when available)
  if (typeof window !== 'undefined') {
    try {
      const origin = window.location.origin;
      devLog('🌍 Client-side domain detected:', origin);

      if (SUPPORTED_DOMAINS.includes(origin)) {
        return origin;
      }

      // If current domain isn't in our list, log and fallback
      devWarn('⚠️ Current domain not in supported list:', origin);
    } catch (error) {
      devWarn('⚠️ Client-side domain detection failed:', error);
    }
  }

  // Method 2: Server-side environment variable detection
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      const normalizedUrl = siteUrl.replace(/\/$/, '');
      devLog('🔧 Environment domain detected:', normalizedUrl);

      if (SUPPORTED_DOMAINS.includes(normalizedUrl)) {
        return normalizedUrl;
      }

      // Try to match partial domain (e.g., if env has different protocol)
      const envDomain = new URL(normalizedUrl).hostname;
      const matchedDomain = SUPPORTED_DOMAINS.find((domain) => {
        return new URL(domain).hostname === envDomain;
      });

      if (matchedDomain) {
        devLog('🔄 Matched domain from hostname:', matchedDomain);
        return matchedDomain;
      }

      devWarn('⚠️ Environment domain not in supported list:', normalizedUrl);
    } catch (error) {
      devWarn('⚠️ Environment domain parsing failed:', error);
    }
  }

  // Method 3: Header-based detection (for server-side rendering)
  if (typeof process !== 'undefined' && process.env) {
    try {
      // Check for various header-based environment variables
      const possibleHosts = [
        process.env.VERCEL_URL,
        process.env.RAILWAY_PUBLIC_DOMAIN,
        process.env.RENDER_EXTERNAL_URL,
        process.env.HOST,
        process.env.HOSTNAME,
      ].filter(Boolean);

      for (const host of possibleHosts) {
        if (host) {
          const fullUrl = host.startsWith('http') ? host : `https://${host}`;
          const normalizedUrl = fullUrl.replace(/\/$/, '');

          if (SUPPORTED_DOMAINS.includes(normalizedUrl)) {
            devLog('🌐 Header-based domain detected:', normalizedUrl);
            return normalizedUrl;
          }
        }
      }
    } catch (error) {
      devWarn('⚠️ Header-based domain detection failed:', error);
    }
  }

  // Method 4: Request headers (Next.js specific)
  try {
    // This will be available in middleware and API routes
    if (typeof Headers !== 'undefined') {
      // In a real deployment, this would be set by the platform
      const host =
        process.env.NEXT_PUBLIC_VERCEL_URL ||
        process.env.NEXT_PUBLIC_DEPLOYMENT_URL;
      if (host) {
        const fullUrl = host.startsWith('http') ? host : `https://${host}`;
        const normalizedUrl = fullUrl.replace(/\/$/, '');

        if (SUPPORTED_DOMAINS.includes(normalizedUrl)) {
          devLog('🚀 Deployment domain detected:', normalizedUrl);
          return normalizedUrl;
        }
      }
    }
  } catch (error) {
    devWarn('⚠️ Deployment domain detection failed:', error);
  }

  // Fallback: Use primary domain priority order
  const fallbackDomain = PRIMARY_DOMAINS[0]; // Default to airqo.net
  devLog('🔄 Using fallback domain:', fallbackDomain);

  return fallbackDomain;
};

/**
 * Get domain for specific purposes (can override the detection)
 */
export const getDomainForContext = (
  context?: 'social' | 'canonical' | 'api',
): string => {
  const detectedDomain = getCurrentDomain();

  // For social media sharing, prefer main domains for better recognition
  if (context === 'social') {
    const hostname = new URL(detectedDomain).hostname;
    if (hostname.includes('airqo.net')) return 'https://airqo.net';
    if (hostname.includes('airqo.africa')) return 'https://airqo.africa';
    if (hostname.includes('airqo.org')) return 'https://airqo.org';
    if (hostname.includes('airqo.mak.ac.ug')) return 'https://airqo.mak.ac.ug';
  }

  return detectedDomain;
};

const DEFAULT_METADATA = {
  siteName: 'AirQo',
  siteUrl: getCurrentDomain(),
  defaultImage: {
    url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
    alt: 'AirQo - Clean Air for All African Cities',
    width: 1200,
    height: 630,
  },
  twitterHandle: '@AirQoProject',
};

export function generateMetadata(config: MetadataConfig): Metadata {
  const image = config.image || DEFAULT_METADATA.defaultImage;

  // Use enhanced domain detection for different contexts
  const canonicalDomain = getDomainForContext('canonical');
  const socialDomain = getDomainForContext('social');

  const fullUrl = config.url.startsWith('http')
    ? config.url
    : `${canonicalDomain}${config.url}`;

  const socialUrl = config.url.startsWith('http')
    ? config.url
    : `${socialDomain}${config.url}`;

  // Intentionally keep metadata generation silent to avoid noisy logs during
  // static generation. Only critical warnings/errors are logged elsewhere.

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    authors: [{ name: 'AirQo' }],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: fullUrl,
      // Add alternative domain links for SEO across all supported domains
      languages: {
        'en-US': fullUrl,
        'en-GB': fullUrl,
        'x-default': fullUrl,
      },
    },
    openGraph: {
      type: config.type || 'website',
      url: socialUrl, // Use social-optimized URL for Open Graph
      title: config.title,
      description: config.description,
      siteName: DEFAULT_METADATA.siteName,
      locale: 'en_US',
      images: [
        {
          url: image.url,
          width: image.width || DEFAULT_METADATA.defaultImage.width,
          height: image.height || DEFAULT_METADATA.defaultImage.height,
          alt: image.alt,
          type: 'image/webp',
        },
      ],
      ...(config.publishedTime && { publishedTime: config.publishedTime }),
      ...(config.modifiedTime && { modifiedTime: config.modifiedTime }),
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
          width: image.width || DEFAULT_METADATA.defaultImage.width,
          height: image.height || DEFAULT_METADATA.defaultImage.height,
        },
      ],
    },
    // Enhanced social media and search engine optimization
    other: {
      // Facebook specific
      'fb:app_id': process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
      // LinkedIn specific
      'article:publisher': 'https://www.linkedin.com/company/airqo/',
      // Additional Twitter metadata
      'twitter:domain': socialDomain.replace('https://', ''),
      'twitter:url': socialUrl,
      // Microsoft specific
      'msapplication-TileColor': '#145DFF',
      'msapplication-TileImage': `${canonicalDomain}/icon-192x192.png`,
      // Apple specific
      'apple-mobile-web-app-title': 'AirQo',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      // Theme color
      'theme-color': '#145DFF',
      // Additional SEO
      'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
      'p:domain_verify': process.env.PINTEREST_DOMAIN_VERIFY || '',
      // Domain detection info (for debugging in development)
      ...(process.env.NODE_ENV === 'development' && {
        'airqo:detected-domain': canonicalDomain,
        'airqo:social-domain': socialDomain,
      }),
    },
    // Verification tokens
    ...(process.env.GOOGLE_SITE_VERIFICATION && {
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
      },
    }),
  };
}

// Separate viewport export function to fix Next.js 14.2+ warnings
export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
  };
}

// Page-specific metadata configurations
export const METADATA_CONFIGS = {
  home: {
    title: 'AirQo | Bridging the Air Quality Data Gap in Africa',
    description:
      'AirQo empowers African communities with accurate, hyperlocal, and timely air quality data to drive pollution mitigation actions. We deploy low-cost sensors and provide real-time insights where 9 out of 10 people breathe polluted air.',
    keywords:
      'AirQo, air quality monitoring Africa, air pollution data, hyperlocal air quality, African cities air quality, real-time pollution data, low-cost air sensors, clean air Africa, air quality analytics, pollution mitigation, environmental monitoring Africa',
    url: '/',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
      alt: 'AirQo Air Quality Monitoring Network Across Africa',
    },
  },
  about: {
    title: 'About AirQo | Leading Air Quality Monitoring in Africa',
    description:
      "Learn about AirQo's journey, mission, and impact in revolutionizing air quality monitoring across Africa. Discover our team, partnerships with Google.org, World Bank, and others, and how we're empowering communities to combat air pollution where 9 out of 10 people breathe polluted air.",
    keywords:
      'AirQo, about AirQo, air quality Africa, AirQo team, AirQo mission, air pollution monitoring, African environmental initiative, clean air Africa, AirQo partners, AirQo impact, air quality research Africa',
    url: '/about-us',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757015506/website/photos/about/teamImage_ganc1y_tyu1ft.webp',
      alt: 'AirQo Team Working on Air Quality Monitoring in Africa',
    },
  },
  monitor: {
    title: 'Air Quality Monitoring Devices | AirQo Binos Monitor',
    description:
      "Deploy AirQo's cost-effective, reliable air quality monitoring devices designed specifically for African urban environments. Our Binos monitors provide accurate, hyperlocal data to identify pollution sources and trends.",
    keywords:
      'air quality monitors, pollution sensors, AirQo monitoring devices, Binos monitor, environmental monitoring equipment, African air quality sensors, urban pollution monitors, air quality measurement devices',
    url: '/products/monitor',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869234/website/photos/OurProducts/Monitor/image15_ua8tyc.jpg',
      alt: 'AirQo Binos Air Quality Monitoring Device',
    },
  },
  analytics: {
    title: 'Air Quality Analytics Platform | AirQo Real-time Data',
    description:
      'Access and visualize real-time and historical air quality information across Africa through our easy-to-use air quality analytics dashboard. Get insights from our growing network of monitors.',
    keywords:
      'air quality analytics, air quality dashboard, real-time air data, African air quality platform, air pollution visualization, environmental data analytics, air quality insights',
    url: '/products/analytics',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728175853/website/photos/analyticsHome_l3hgcy.png',
      alt: 'AirQo Air Quality Analytics Platform Dashboard',
    },
  },
  api: {
    title: 'Air Quality API | Open Air Quality Data for Developers',
    description:
      "Leverage AirQo's open air quality data through our comprehensive API. Access real-time and historical air quality information to build applications that impact African communities.",
    keywords:
      'air quality API, open air data, developer API, air quality data access, environmental API, African air quality data, pollution data API',
    url: '/products/api',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1729071534/website/photos/wrapper_zpnvdw.png',
      alt: 'AirQo Air Quality API for Developers',
    },
  },
  mobileApp: {
    title: 'AirQo Mobile App | Air Quality in Your Pocket',
    description:
      'Discover the quality of air you are breathing with the AirQo mobile app. Get real-time air quality information, personalized insights, and health recommendations for African cities.',
    keywords:
      'AirQo mobile app, air quality app, mobile air quality, air pollution app, air quality mobile, African air quality app, real-time air quality mobile',
    url: '/products/mobile-app',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742911840/website/photos/OurProducts/MobileApp/Home___Light_mode_aw3ysg.png',
      alt: 'AirQo Mobile App Interface',
    },
  },
  calibrate: {
    title: 'AirQalibrate | Air Quality Sensor Calibration Platform',
    description:
      'Ensure the accuracy of your air quality sensors with AirQalibrate, our advanced calibration platform designed to maintain data quality and reliability across monitoring networks.',
    keywords:
      'air quality calibration, sensor calibration, AirQalibrate, air quality data quality, sensor accuracy, environmental monitoring calibration',
    url: '/products/calibrate',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
      alt: 'AirQalibrate Sensor Calibration Platform',
    },
  },
  contact: {
    title: "Contact AirQo | Get in Touch with Africa's Air Quality Experts",
    description:
      'Contact AirQo for air quality monitoring solutions, partnerships, or support. Reach out to our team of experts working to improve air quality across African cities.',
    keywords:
      'contact AirQo, air quality support, AirQo partnerships, air quality consultation, AirQo team contact, environmental monitoring support, air quality solutions inquiry',
    url: '/contact',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757015506/website/photos/about/teamImage_ganc1y_tyu1ft.webp',
      alt: 'Contact AirQo Team - Air Quality Experts',
    },
  },
  exploreData: {
    title: 'Explore Air Quality Data | Live Air Quality Map Across Africa',
    description:
      'Explore real-time air quality data across African cities. View live air quality maps, historical trends, and detailed pollution insights from our extensive monitoring network.',
    keywords:
      'air quality data, air quality map, African air quality, real-time air pollution, air quality explorer, live air data, environmental data visualization',
    url: '/explore-data',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
      alt: 'AirQo Air Quality Data Explorer Map',
    },
  },
  cleanAirForum: {
    title: 'CLEAN-Air Forum 2025 | Partnerships for Clean Air Solutions',
    description:
      "Join the CLEAN-Air Forum 2025 in Nairobi, Kenya - Africa's premier air quality convening. Learn about partnerships for clean air solutions, knowledge sharing, and multi-regional collaboration to tackle air pollution in African cities.",
    keywords:
      'CLEAN-Air Forum 2025, Nairobi air quality conference, African air quality forum, clean air partnerships, air pollution solutions Africa, environmental conference Kenya, air quality knowledge sharing',
    url: '/clean-air-forum/about',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Nairobi',
    },
  },
  // Solutions pages
  solutionsAfricanCities: {
    title: 'Air Quality Solutions for African Cities | AirQo',
    description:
      "Discover AirQo's comprehensive air quality monitoring and data solutions designed specifically for African cities. Empowering city governments with real-time data to tackle urban air pollution.",
    keywords:
      'African cities air quality, urban air pollution solutions, city air monitoring, African urban environment, smart city air quality, municipal air quality management',
    url: '/solutions/african-cities',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869234/website/photos/OurProducts/Monitor/image15_ua8tyc.jpg',
      alt: 'Air Quality Solutions for African Cities',
    },
  },
  solutionsCommunities: {
    title: 'Community Air Quality Solutions | AirQo',
    description:
      'Empower African communities with accessible air quality data and tools. AirQo provides hyperlocal air quality insights to help communities understand and address air pollution in their neighborhoods.',
    keywords:
      'community air quality, grassroots air monitoring, community air pollution, local air quality data, African community empowerment, neighborhood air quality',
    url: '/solutions/communities',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132440/website/photos/community/Rectangle_411_toaajz.webp',
      alt: 'Community Air Quality Solutions',
    },
  },
  solutionsResearch: {
    title: 'Air Quality Research Solutions | AirQo',
    description:
      'Access comprehensive air quality datasets and research tools for academic and policy research. AirQo supports researchers across Africa with reliable environmental data and analytics.',
    keywords:
      'air quality research, environmental research Africa, air pollution data research, academic air quality tools, policy research air quality, environmental monitoring research',
    url: '/solutions/research',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
      alt: 'Air Quality Research Solutions',
    },
  },
  // Legal pages
  privacyPolicy: {
    title: 'Privacy Policy | AirQo',
    description:
      'Learn how AirQo collects, uses, and protects your personal information. Our privacy policy outlines our commitment to data security and user privacy.',
    keywords:
      'AirQo privacy policy, data privacy, personal information protection, data security, privacy terms',
    url: '/legal/privacy-policy',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869234/website/photos/OurProducts/Monitor/image15_ua8tyc.jpg',
      alt: 'AirQo Privacy and Data Protection',
    },
  },
  termsOfService: {
    title: 'Terms of Service | AirQo',
    description:
      "Read AirQo's terms of service for using our air quality monitoring platform, mobile app, and data services.",
    keywords:
      'AirQo terms of service, terms and conditions, service agreement, platform terms',
    url: '/legal/terms-of-service',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869234/website/photos/OurProducts/Monitor/image15_ua8tyc.jpg',
      alt: 'AirQo Terms of Service Agreement',
    },
  },
  paymentRefundPolicy: {
    title: 'Payment & Refund Policy | AirQo',
    description:
      "Understand AirQo's payment processing and refund policies for our services and products.",
    keywords:
      'AirQo payment policy, refund policy, billing terms, payment processing',
    url: '/legal/payment-refund-policy',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741869234/website/photos/OurProducts/Monitor/image15_ua8tyc.jpg',
      alt: 'AirQo Payment and Billing Policies',
    },
  },
  airqoDataPolicy: {
    title: 'AirQo Data Policy | Open Air Quality Data',
    description:
      "Learn about AirQo's data sharing policy, licensing terms, and how our open air quality data can be used by researchers, developers, and organizations.",
    keywords:
      'AirQo data policy, open data, air quality data licensing, data usage terms, environmental data sharing',
    url: '/legal/airqo-data',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742912754/website/photos/Screenshot_2025-03-25_172412_amk2tl.png',
      alt: 'AirQo Open Data Policy and Licensing',
    },
  },
  // CLEAN-Air Forum specific pages
  cleanAirForumSessions: {
    title: 'Conference Sessions & Schedule | CLEAN-Air Forum 2025',
    description:
      'Explore the CLEAN-Air Forum 2025 sessions, workshops, and schedule in Nairobi. Plan your attendance at key presentations and discussions on air quality monitoring, policy, and solutions.',
    keywords:
      'CLEAN-Air Forum sessions, conference schedule, air quality workshops, environmental presentations, conference agenda, forum timeline, Nairobi 2025',
    url: '/clean-air-forum/clean-air-forum-2025/sessions',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Sessions',
    },
  },
  cleanAirForumSpeakers: {
    title: 'Speakers & Presenters | CLEAN-Air Forum 2025',
    description:
      'Meet our distinguished speakers and presenters at the CLEAN-Air Forum 2025 in Nairobi. Leading experts in air quality, environmental science, and policy sharing insights on partnerships for clean air solutions in Africa.',
    keywords:
      'CLEAN-Air Forum speakers, air quality experts, environmental scientists, conference presenters, air pollution experts, African environmental leaders, Nairobi 2025',
    url: '/clean-air-forum/clean-air-forum-2025/speakers',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Speakers',
    },
  },
  cleanAirForumResources: {
    title: 'Resources & Downloads | CLEAN-Air Forum 2025',
    description:
      'Access resources, presentations, and materials from the CLEAN-Air Forum 2025. Download research papers, policy briefs, and tools for air quality improvement in African cities.',
    keywords:
      'CLEAN-Air Forum resources, air quality resources, conference materials, environmental research, policy briefs, African air quality tools',
    url: '/clean-air-forum/clean-air-forum-2025/resources',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Resources',
    },
  },
  cleanAirForumSponsorships: {
    title: 'Sponsorships | CLEAN-Air Forum 2025',
    description:
      'Partner with the CLEAN-Air Forum 2025 in Nairobi. Explore sponsorship opportunities to support partnerships for clean air solutions across Africa.',
    keywords:
      'CLEAN-Air Forum sponsorship, air quality conference sponsorship, environmental partnership opportunities, Nairobi 2025',
    url: '/clean-air-forum/clean-air-forum-2025/sponsorships',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Sponsorships',
    },
  },
  cleanAirForumLogistics: {
    title: 'Logistics & Travel | CLEAN-Air Forum 2025',
    description:
      'Plan your visit to the CLEAN-Air Forum 2025 in Nairobi, Kenya. Find information about venue, accommodation, travel, and logistics for the premier African air quality conference.',
    keywords:
      'CLEAN-Air Forum logistics, Nairobi conference venue, travel Kenya, conference accommodation, air quality forum travel',
    url: '/clean-air-forum/clean-air-forum-2025/logistics',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Nairobi Venue',
    },
  },
  cleanAirForumProgramCommittee: {
    title: 'Program Committee | CLEAN-Air Forum 2025',
    description:
      'Meet the program committee organizing the CLEAN-Air Forum 2025. Leading researchers, policymakers, and practitioners shaping the agenda for clean air partnerships in Africa.',
    keywords:
      'CLEAN-Air Forum committee, conference organizers, air quality experts, environmental leadership, African research committee',
    url: '/clean-air-forum/clean-air-forum-2025/program-committee',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Program Committee',
    },
  },
  cleanAirForumGlossary: {
    title: 'Glossary | CLEAN-Air Forum 2025',
    description:
      'Understand key terms and concepts related to air quality monitoring, pollution mitigation, and environmental policy. A comprehensive glossary for the CLEAN-Air Forum 2025.',
    keywords:
      'air quality glossary, environmental terms, pollution definitions, air monitoring terminology, clean air concepts',
    url: '/clean-air-forum/clean-air-forum-2025/glossary',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'Air Quality Terms and Definitions',
    },
  },
  cleanAirForumPartners: {
    title: 'Partners | CLEAN-Air Forum 2025',
    description:
      'Meet our partners supporting the CLEAN-Air Forum 2025. Organizations working together to advance clean air solutions and partnerships across Africa.',
    keywords:
      'CLEAN-Air Forum partners, air quality partnerships, environmental collaboration, African organizations, clean air sponsors',
    url: '/clean-air-forum/clean-air-forum-2025/partners',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1747588673/website/cleanAirForum/images/WhatsApp_Image_2025-05-16_at_11.03.31_AM_xtrxg9.jpg',
      alt: 'CLEAN-Air Forum 2025 Partners',
    },
  },
  careers: {
    title: 'Careers at AirQo | Join the Fight Against Air Pollution',
    description:
      "Join AirQo's mission to combat air pollution in Africa. Explore career opportunities in environmental monitoring, data science, engineering, and community impact.",
    keywords:
      'AirQo careers, environmental jobs Africa, air quality jobs, impact careers, sustainability jobs, African environmental careers',
    url: '/careers',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728310706/website/photos/about/careerImage_t91yzh.png',
      alt: 'AirQo Team Careers',
    },
  },
  events: {
    title: 'Events | AirQo',
    description:
      'Stay updated with AirQo events, conferences, workshops, and community engagements focused on air quality improvement across Africa.',
    keywords:
      'AirQo events, air quality conferences, environmental events Africa, air pollution workshops, community events',
    url: '/events',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/section1_usfuoj.webp',
      alt: 'AirQo Events',
    },
  },
  press: {
    title: 'Press & Media | AirQo',
    description:
      'Access AirQo press releases, media coverage, and resources for journalists covering air quality and environmental issues in Africa.',
    keywords:
      'AirQo press, media coverage, press releases, environmental journalism, air quality news Africa',
    url: '/press',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757015506/website/photos/about/teamImage_ganc1y_tyu1ft.webp',
      alt: 'AirQo Press and Media',
    },
  },
  resources: {
    title: 'Resources | AirQo',
    description:
      "Access AirQo's comprehensive library of air quality resources, research publications, reports, and educational materials for better understanding of air pollution in Africa.",
    keywords:
      'AirQo resources, air quality resources, environmental publications, air pollution research, educational materials Africa',
    url: '/resources',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
      alt: 'AirQo Resources',
    },
  },
  faqs: {
    title: 'Frequently Asked Questions | AirQo',
    description:
      'Find answers to common questions about AirQo, our air quality monitoring services, data access, and how we help African communities combat air pollution.',
    keywords:
      'AirQo FAQ, frequently asked questions, air quality questions, AirQo help, air monitoring questions, air quality data FAQ',
    url: '/faqs',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
      alt: 'AirQo Frequently Asked Questions',
    },
  },
  // Partners page
  partners: {
    title: 'Partners | AirQo',
    description:
      "Meet AirQo's partners and collaborators working together to improve air quality across Africa. Learn about our partnerships with Google.org, World Bank, and other organizations.",
    keywords:
      'AirQo partners, air quality partnerships, environmental collaboration, African partnerships, Google.org partnership, World Bank partnership',
    url: '/partners',
    image: {
      url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757015506/website/photos/about/teamImage_ganc1y_tyu1ft.webp',
      alt: 'AirQo Partners',
    },
  },
} as const;
