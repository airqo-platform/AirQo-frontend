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
    // TODO: Add OG image at /assets/images/icons-package-og.png (1200x630)
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
