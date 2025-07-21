import { Metadata } from 'next';
import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | AirQo About',
    default: 'About AirQo | Leading Air Quality Monitoring in Africa',
  },
  description:
    'Learn about AirQo, our mission to bridge the air quality data gap in Africa, our team, impact, and how we empower communities with accurate air quality information.',
  keywords:
    'About AirQo, AirQo mission, African air quality organization, environmental monitoring team, clean air advocacy, air quality research Africa',
};

type AboutLayoutProps = {
  children: React.ReactNode;
};

const AboutLayout: React.FC<AboutLayoutProps> = ({ children }) => {
  return <MainLayout>{children}</MainLayout>;
};

export default AboutLayout;
