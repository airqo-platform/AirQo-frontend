import { Metadata } from 'next';
import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';

export const metadata: Metadata = {
  title: 'AirQo Solutions | Air Quality for African Cities and Communities',
  description:
    'Discover AirQo’s solutions for improving air quality across African cities and communities. Explore our research, partnerships, and tools designed to address air pollution challenges in Africa.',
  keywords:
    'AirQo solutions, air quality solutions, African cities air quality, community air quality, air quality research, air pollution solutions, environmental solutions Africa, clean air Africa, air quality projects',
  openGraph: {
    title: 'AirQo Solutions - Air Quality for African Cities and Communities',
    description:
      'Explore AirQo’s solutions to improve air quality in African cities and communities, including research and collaborative projects aimed at addressing air pollution challenges.',
    url: 'https://yourdomain.com/solutions',
    siteName: 'AirQo',
    images: [
      {
        url: 'https://yourdomain.com/static/solutions-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Solutions - Air Quality for African Cities and Communities',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQo',
    title: 'AirQo Solutions - Air Quality for African Cities and Communities',
    description:
      'Learn about AirQo’s air quality solutions for African cities and communities, and how we’re addressing air pollution challenges through innovative research and collaborations.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://yourdomain.com/solutions',
  },
};

type SolutionsLayoutLayoutProps = {
  children: React.ReactNode;
};

const SolutionsLayout: React.FC<SolutionsLayoutLayoutProps> = ({
  children,
}) => {
  return <MainLayout>{children}</MainLayout>;
};

export default SolutionsLayout;
