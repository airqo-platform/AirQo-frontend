import { Metadata } from 'next';
import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | AirQo Packages',
    default: 'AirQo Packages',
  },
  description:
    'Open source packages and developer tools from AirQo. Multi-framework icon libraries, SDKs, and more for building air quality applications.',
  keywords: [
    'airqo packages',
    'open source',
    'developer tools',
    'icons',
    'react icons',
    'vue icons',
    'flutter icons',
    'air quality sdk',
    'npm packages',
  ],
  openGraph: {
    title: 'AirQo Packages - Open Source Developer Tools',
    description:
      'Explore AirQo open source packages including multi-framework icon libraries, SDKs, and tools for air quality applications.',
    type: 'website',
  },
};

export default function PackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
