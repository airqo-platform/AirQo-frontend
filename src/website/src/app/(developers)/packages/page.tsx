import { Metadata } from 'next';
import React from 'react';

import PackagesPage from '@/features/packages/PackagesPage';
import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

const packagesOgImage = optimizeCloudinaryUrl(
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1729071534/website/photos/wrapper_zpnvdw.png',
  { width: 1200 },
);

export const metadata: Metadata = {
  title: 'Open Source Packages',
  description:
    'Discover AirQo open source packages and developer tools. Multi-framework icon libraries, SDKs, and components for building air quality applications.',
  openGraph: {
    title: 'AirQo Open Source Packages',
    description:
      'Multi-framework icon libraries, SDKs, and developer tools for air quality applications. Available for React, Vue, Flutter, and more.',
    images: [
      {
        url: packagesOgImage,
        width: 1200,
        height: 630,
        alt: 'AirQo Open Source Packages - Developer Tools for Air Quality Applications',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AirQo Open Source Packages',
    description:
      'Multi-framework icon libraries and developer tools for air quality applications.',
  },
};

export default function Page() {
  return <PackagesPage />;
}
