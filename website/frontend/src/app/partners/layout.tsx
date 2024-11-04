import { Metadata } from 'next';
import React from 'react';

import Navbar from '@/components/layouts/Navbar';

export const metadata: Metadata = {
  title: 'Our Partners | AirQo Collaborations and Partnerships',
  description:
    'Discover the organizations and partners working with AirQo to improve air quality across Africa. Learn about the strategic collaborations aimed at addressing air pollution and environmental health challenges.',
  keywords:
    'AirQo partners, air quality partners, environmental collaborations, air quality improvement, air pollution solutions, environmental health, AirQo collaborations, strategic partnerships',
  openGraph: {
    title: 'Our Partners - AirQo Collaborations and Partnerships',
    description:
      'Explore the organizations working with AirQo to improve air quality across Africa. Learn about our partnerships and collaborations aimed at addressing air pollution and improving environmental health.',
    url: 'https://yourdomain.com/partners',
    siteName: 'AirQo',
    images: [
      {
        url: 'https://yourdomain.com/static/partners-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Partners - Collaborating for Better Air Quality',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQo',
    title: 'Our Partners - AirQo Collaborations and Partnerships',
    description:
      'Learn about AirQo’s partners and their collaborative efforts to improve air quality across Africa.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://yourdomain.com/partners',
  },
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
