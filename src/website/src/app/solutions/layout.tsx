import { Metadata } from 'next';
import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | AirQo Solutions',
    default: 'Air Quality Solutions for African Cities and Communities',
  },
  description:
    "Discover AirQo's comprehensive solutions for improving air quality across African cities and communities. Our research-backed approaches and partnerships address air pollution challenges throughout Africa.",
  keywords:
    'AirQo solutions, air quality solutions, African cities air quality, community air quality, air pollution solutions, environmental solutions Africa',
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
