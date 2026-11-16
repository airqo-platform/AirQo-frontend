import { Metadata } from 'next';

import { IconsDocsPage } from '@/features/packages/icons/docs';
import { DEFAULT_METADATA } from '@/lib/metadata';

export const metadata: Metadata = {
  title: { absolute: 'AirQo Icons Documentation | React, Vue, and Flutter' },
  description:
    'Official documentation for @airqo/icons library. Learn how to install, customize, and optimize SVG icons for your AirQo applications.',
  openGraph: {
    title: 'AirQo Icons Documentation',
    description:
      'Complete guide for using AirQo icons in React, Vue, and Flutter projects.',
    url: '/packages/icons/docs',
    siteName: 'AirQo',
    images: [
      {
        url: DEFAULT_METADATA.defaultImage.url,
        width: 1200,
        height: 630,
        alt: DEFAULT_METADATA.defaultImage.alt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQoProject',
    title: 'AirQo Icons Documentation',
    description:
      'Complete guide for using AirQo icons in React, Vue, and Flutter projects.',
    images: [DEFAULT_METADATA.defaultImage.url],
  },
  alternates: { canonical: '/packages/icons/docs' },
};

export default function Page() {
  return <IconsDocsPage />;
}
