import { Metadata } from 'next';
import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';

export const metadata: Metadata = {
  title: 'AirQo Products | Air Quality Solutions and Tools',
  description:
    'Explore AirQo’s suite of products, including air quality analytics, APIs, calibration tools, mobile apps, and monitoring solutions. Discover tools to help monitor and improve air quality across Africa.',
  keywords:
    'AirQo products, air quality analytics, air quality API, air quality calibration, air quality mobile app, air quality monitoring, AirQo tools, environmental solutions',
};

type ProductsLayoutProps = {
  children: React.ReactNode;
};

const ProductsLayout: React.FC<ProductsLayoutProps> = ({ children }) => {
  return <MainLayout>{children}</MainLayout>;
};

export default ProductsLayout;
