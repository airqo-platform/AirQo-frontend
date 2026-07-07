import React from 'react';
import { Metadata } from 'next';
import { MapPage } from '@/modules/airqo-map';

export const metadata: Metadata = {
  title: 'Air Quality Map',
  description:
    'Interactive map showing real-time air quality data across monitoring locations in Africa.',
  openGraph: {
    title: 'Air Quality Map | AirQo Nexus',
    description:
      'Interactive map showing real-time air quality data across monitoring locations in Africa.',
    images: [
      {
        url: '/images/illustration.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Nexus - Air Quality Map',
      },
    ],
  },
};

const Page = () => {
  return <MapPage />;
};

export default Page;
