import { Metadata } from 'next';
import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';
import HomePage from '@/views/home/HomePage';

export const metadata: Metadata = {
  title: 'Home | AirQo - Clean Air for All African Cities',
  description:
    'Join AirQo in bridging the air quality data gap in Africa. We provide accurate, hyperlocal, and timely air quality data to empower communities and drive pollution mitigation actions across African cities.',
  keywords:
    'AirQo home, African air quality, clean air solutions, air pollution monitoring, hyperlocal air data, African cities air quality, environmental monitoring Africa, air quality management',
  alternates: {
    canonical: 'https://airqo.net/home',
  },
  openGraph: {
    type: 'website',
    url: 'https://airqo.net/home',
    title: 'Home | AirQo - Clean Air for All African Cities',
    description:
      'Join AirQo in bridging the air quality data gap in Africa. We provide accurate, hyperlocal, and timely air quality data to empower communities.',
    images: [
      {
        url: 'https://airqo.net/icon.png',
        width: 1200,
        height: 630,
        alt: 'AirQo Home - Clean Air for All African Cities',
      },
    ],
    siteName: 'AirQo',
  },
};

const page = () => {
  return (
    <MainLayout>
      <HomePage />
    </MainLayout>
  );
};

export default page;
