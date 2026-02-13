import { Metadata } from 'next';
import React from 'react';

import IconsPackagePage from '@/views/packages/IconsPackagePage';

export const metadata: Metadata = {
  title: 'AirQo Icons',
  description:
    'Beautiful multi-framework icon library for modern applications. 1,383+ icons across 22 categories for React, Vue, and Flutter with TypeScript support.',
  keywords: [
    'airqo icons',
    'react icons',
    'vue icons',
    'flutter icons',
    'typescript icons',
    'icon library',
    'air quality icons',
    'open source icons',
  ],
  openGraph: {
    title: 'AirQo Icons - Multi-Framework Icon Library',
    description:
      '1,383+ beautiful icons for React, Vue, and Flutter. Fully customizable with TypeScript support and tree-shakable imports.',
    images: [
      {
        url: '/assets/images/icons-package-og.png',
        width: 1200,
        height: 630,
        alt: 'AirQo Icons Package',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AirQo Icons - Multi-Framework Icon Library',
    description:
      '1,383+ icons for React, Vue, and Flutter with TypeScript support.',
  },
};

export default function Page() {
  return <IconsPackagePage />;
}
