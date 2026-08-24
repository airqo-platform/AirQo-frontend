import { Metadata } from 'next';
import React from 'react';

import MainLayout from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | AirQo Packages',
    default: 'AirQo Packages',
  },
  description:
    'Open source packages and developer tools from AirQo, including multi-framework icon libraries and Vertex IoT app scaffolding.',
  keywords: [
    'airqo packages',
    'open source',
    'developer tools',
    'icons',
    'react icons',
    'vue icons',
    'flutter icons',
    'air quality sdk',
    'vertex iot',
    'create vertex app',
    'npm packages',
  ],
  openGraph: {
    title: 'AirQo Packages - Open Source Developer Tools',
    description:
      'Explore AirQo open source packages including multi-framework icon libraries, Vertex IoT app scaffolding, SDKs, and developer tools.',
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
