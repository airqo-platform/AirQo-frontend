import React from 'react';
import { Metadata } from 'next';
import { MapPage } from '@/modules/airqo-map';

export const metadata: Metadata = {
  title: 'Air Quality Map',
  description:
    'Interactive map showing real-time air quality data across monitoring locations in Africa.',
  openGraph: {
    title: 'Air Quality Map | AirQo Analytics',
    description:
      'Interactive map showing real-time air quality data across monitoring locations in Africa.',
    images: [
      {
        url: '/images/illustration.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Analytics - Air Quality Map',
      },
    ],
  },
};

const Page = () => {
  return <MapPage />;
};

export default Page;
