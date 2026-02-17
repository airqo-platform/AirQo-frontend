import { Metadata } from 'next';

import { IconsDocsPage } from '@/views/packages/icons/docs';

export const metadata: Metadata = {
  title: 'AirQo Icons Documentation - React, Vue, & Flutter',
  description:
    'Official documentation for @airqo/icons library. Learn how to install, customize, and optimize SVG icons for your AirQo applications.',
  openGraph: {
    title: 'AirQo Icons Documentation',
    description:
      'Complete guide for using AirQo icons in React, Vue, and Flutter projects.',
  },
};

export default function Page() {
  return <IconsDocsPage />;
}
