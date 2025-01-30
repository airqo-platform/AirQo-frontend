import { Metadata } from 'next';
import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';

export const metadata: Metadata = {
  title: 'AirQo Solutions | Air Quality for African Cities and Communities',
  description:
    'Discover AirQo’s solutions for improving air quality across African cities and communities. Explore our research, partnerships, and tools designed to address air pollution challenges in Africa.',
  keywords:
    'AirQo solutions, air quality solutions, African cities air quality, community air quality, air quality research, air pollution solutions, environmental solutions Africa, clean air Africa, air quality projects',
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
