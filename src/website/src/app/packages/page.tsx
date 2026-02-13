import { Metadata } from 'next';
import React from 'react';

import PackagesPage from '@/views/packages/PackagesPage';

export const metadata: Metadata = {
  title: 'Open Source Packages',
  description:
    'Discover AirQo open source packages and developer tools. Multi-framework icon libraries, SDKs, and components for building air quality applications.',
  openGraph: {
    title: 'AirQo Open Source Packages',
    description:
      'Multi-framework icon libraries, SDKs, and developer tools for air quality applications. Available for React, Vue, Flutter, and more.',
    // TODO: Add OG image at /assets/images/packages-og.png (1200x630)
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
