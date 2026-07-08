import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: {
    template: '%s | AirQo',
    default: 'AirQo | Bridging the Air Quality Data Gap in Africa',
  },
  description:
    'AirQo empowers African communities with accurate, hyperlocal, and timely air quality data to drive pollution mitigation actions.',
};

type SiteLayoutProps = {
  children: React.ReactNode;
};

const SiteLayout: React.FC<SiteLayoutProps> = ({ children }) => {
  return <>{children}</>;
};

export default SiteLayout;
