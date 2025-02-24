import { Metadata } from 'next';
import React from 'react';

import Navbar from '@/components/layouts/Navbar';

export const metadata: Metadata = {
  title: 'Our Partners | AirQo Collaborations and Partnerships',
  description:
    'Discover the organizations and partners working with AirQo to improve air quality across Africa. Learn about the strategic collaborations aimed at addressing air pollution and environmental health challenges.',
  keywords:
    'AirQo partners, air quality partners, environmental collaborations, air quality improvement, air pollution solutions, environmental health, AirQo collaborations, strategic partnerships',
};

type PartnersLayoutProps = {
  children: React.ReactNode;
};

const PartnersLayout: React.FC<PartnersLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default PartnersLayout;
