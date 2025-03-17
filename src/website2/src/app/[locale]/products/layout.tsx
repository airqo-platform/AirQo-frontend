import { Metadata } from 'next';
import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | AirQo Products',
    default: 'Air Quality Solutions and Tools | AirQo Products',
  },
  description:
    "Explore AirQo's comprehensive suite of air quality products, including monitoring devices, analytics platforms, APIs, calibration tools, and mobile applications for African cities.",
  keywords:
    'AirQo products, air quality solutions, air monitoring tools, air quality technology, African air quality, pollution monitoring devices, environmental monitoring',
};

type ProductsLayoutProps = {
  children: React.ReactNode;
};

const ProductsLayout: React.FC<ProductsLayoutProps> = ({ children }) => {
  return <MainLayout>{children}</MainLayout>;
};

export default ProductsLayout;
