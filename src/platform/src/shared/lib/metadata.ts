import { Metadata } from 'next';
import {
  getPageTitle,
  capitalizeTitle,
} from '@/shared/components/header/config/pageTitles';

// Base metadata configuration
const baseMetadata: Metadata = {
  title: {
    default: 'AirQo Platform',
    template: '%s | AirQo Platform',
  },
  description:
    'AirQo Platform - Advanced air quality monitoring and analytics for Africa.',
  keywords: ['air quality', 'monitoring', 'Africa', 'analytics', 'environment'],
  authors: [{ name: 'AirQo Team' }],
  creator: 'AirQo',
  publisher: 'AirQo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'https://analytics.airqo.net'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'AirQo Platform',
    title: 'AirQo Platform',
    description: 'Advanced air quality monitoring and analytics for Africa.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AirQo Platform',
    description: 'Advanced air quality monitoring and analytics for Africa.',
    images: ['/images/twitter-image.jpg'],
    creator: '@AirQoProject',
  },
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

// Page-specific metadata overrides
const pageMetadata: Record<string, Partial<Metadata>> = {
  '/user/home': {
    title: 'Home',
    description:
      'Welcome to your AirQo dashboard. Monitor air quality data and insights.',
    openGraph: {
      title: 'Home | AirQo Platform',
      description:
        'Welcome to your AirQo dashboard. Monitor air quality data and insights.',
    },
  },
  '/user/map': {
    title: 'Air Quality Map',
    description:
      'Interactive map showing real-time air quality data across monitoring locations.',
    openGraph: {
      title: 'Air Quality Map | AirQo Platform',
      description:
        'Interactive map showing real-time air quality data across monitoring locations.',
    },
  },
  '/user/profile': {
    title: 'User Profile',
    description: 'Manage your AirQo account settings and preferences.',
    openGraph: {
      title: 'User Profile | AirQo Platform',
      description: 'Manage your AirQo account settings and preferences.',
    },
  },
  '/user/favorites': {
    title: 'Favorite Locations',
    description:
      'View and manage your favorite air quality monitoring locations.',
    openGraph: {
      title: 'Favorite Locations | AirQo Platform',
      description:
        'View and manage your favorite air quality monitoring locations.',
    },
  },
  '/user/data-export': {
    title: 'Data Export',
    description: 'Export air quality data for analysis and reporting.',
    openGraph: {
      title: 'Data Export | AirQo Platform',
      description: 'Export air quality data for analysis and reporting.',
    },
  },
  '/org/dashboard': {
    title: 'Organization Dashboard',
    description:
      'Comprehensive dashboard for organization air quality monitoring and management.',
    openGraph: {
      title: 'Organization Dashboard | AirQo Platform',
      description:
        'Comprehensive dashboard for organization air quality monitoring and management.',
    },
  },
  '/org/data-export': {
    title: 'Organization Data Export',
    description:
      'Export organization air quality data for analysis and reporting.',
    openGraph: {
      title: 'Organization Data Export | AirQo Platform',
      description:
        'Export organization air quality data for analysis and reporting.',
    },
  },
  '/org/favorites': {
    title: 'Organization Favorites',
    description: 'Manage favorite locations for your organization.',
    openGraph: {
      title: 'Organization Favorites | AirQo Platform',
      description: 'Manage favorite locations for your organization.',
    },
  },
  '/org/members': {
    title: 'Organization Members',
    description: 'Manage organization members and their access permissions.',
    openGraph: {
      title: 'Organization Members | AirQo Platform',
      description: 'Manage organization members and their access permissions.',
    },
  },
  '/org/profile': {
    title: 'Organization Profile',
    description: 'Manage your organization profile and settings.',
    openGraph: {
      title: 'Organization Profile | AirQo Platform',
      description: 'Manage your organization profile and settings.',
    },
  },
  '/org/role-permissions': {
    title: 'Role Permissions',
    description: 'Configure roles and permissions for organization members.',
    openGraph: {
      title: 'Role Permissions | AirQo Platform',
      description: 'Configure roles and permissions for organization members.',
    },
  },
  '/org/settings': {
    title: 'Organization Settings',
    description: 'Configure organization-wide settings and preferences.',
    openGraph: {
      title: 'Organization Settings | AirQo Platform',
      description: 'Configure organization-wide settings and preferences.',
    },
  },
};

// Generate metadata for a specific page
export function generatePageMetadata(pathname: string): Metadata {
  // Handle dynamic org routes
  let pageKey = pathname;
  if (pathname.startsWith('/org/')) {
    const parts = pathname.split('/');
    if (parts.length >= 4) {
      // org/slug/page
      pageKey = `/org/${parts[3]}`;
    }
  }

  // Handle user routes
  if (pathname.startsWith('/user/')) {
    const parts = pathname.split('/');
    if (parts.length >= 3) {
      pageKey = `/user/${parts[2]}`;
    }
  }

  const pageSpecificMetadata = pageMetadata[pageKey] || {};

  // Generate dynamic title if not specified
  const title = pageSpecificMetadata.title || getPageTitle(pathname);
  const capitalizedTitle =
    typeof title === 'string' ? capitalizeTitle(title) : title;

  return {
    ...baseMetadata,
    ...pageSpecificMetadata,
    title: capitalizedTitle,
    openGraph: {
      ...baseMetadata.openGraph,
      ...pageSpecificMetadata.openGraph,
      title: capitalizedTitle,
    },
    twitter: {
      ...baseMetadata.twitter,
      ...pageSpecificMetadata.twitter,
      title: capitalizedTitle,
    },
  };
}

// Generate metadata for organization pages with dynamic slug
export function generateOrgMetadata(slug: string, subPath: string): Metadata {
  const pathname = `/org/${subPath}`;
  const pageSpecificMetadata = pageMetadata[pathname] || {};

  const title = pageSpecificMetadata.title || getPageTitle(pathname);
  const capitalizedTitle =
    typeof title === 'string' ? capitalizeTitle(title) : title;

  return {
    ...baseMetadata,
    ...pageSpecificMetadata,
    title: `${capitalizedTitle} - ${slug}`,
    description: `${pageSpecificMetadata.description || 'Organization management and air quality monitoring.'} - ${slug}`,
    openGraph: {
      ...baseMetadata.openGraph,
      ...pageSpecificMetadata.openGraph,
      title: `${capitalizedTitle} - ${slug} | AirQo Platform`,
      description: `${pageSpecificMetadata.openGraph?.description || pageSpecificMetadata.description || 'Organization management and air quality monitoring.'} - ${slug}`,
    },
    twitter: {
      ...baseMetadata.twitter,
      ...pageSpecificMetadata.twitter,
      title: `${capitalizedTitle} - ${slug} | AirQo Platform`,
      description: `${pageSpecificMetadata.twitter?.description || pageSpecificMetadata.description || 'Organization management and air quality monitoring.'} - ${slug}`,
    },
  };
}

// Default export for root layout
export default baseMetadata;
