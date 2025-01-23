import { Metadata } from 'next';
import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';

export const metadata: Metadata = {
  title: 'AirQo Products | Air Quality Solutions and Tools',
  description:
    'Explore AirQo’s suite of products, including air quality analytics, APIs, calibration tools, mobile apps, and monitoring solutions. Discover tools to help monitor and improve air quality across Africa.',
  keywords:
    'AirQo products, air quality analytics, air quality API, air quality calibration, air quality mobile app, air quality monitoring, AirQo tools, environmental solutions',
  openGraph: {
    title: 'AirQo Products - Air Quality Solutions and Tools',
    description:
      'Discover AirQo’s range of air quality products and tools, from analytics and APIs to mobile apps and monitoring systems, designed to improve air quality in Africa.',
    url: 'https://yourdomain.com/products',
    siteName: 'AirQo',
    images: [
      {
        url: 'https://yourdomain.com/static/products-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Products - Air Quality Solutions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQo',
    title: 'AirQo Products - Air Quality Solutions and Tools',
    description:
      'Explore AirQo’s air quality analytics, APIs, mobile apps, and monitoring tools designed to improve air quality across Africa.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://yourdomain.com/products',
  },
};

type ProductsLayoutProps = {
  children: React.ReactNode;
};

const ProductsLayout: React.FC<ProductsLayoutProps> = ({ children }) => {
  return <MainLayout>{children}</MainLayout>;
};

export default ProductsLayout;
