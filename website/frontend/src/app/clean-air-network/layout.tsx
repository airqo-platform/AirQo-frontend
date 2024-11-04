import { Metadata } from 'next';
import React from 'react';

import ActionButtons2 from '@/components/layouts/ActionButtons2';
import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/Navbar';

export const metadata: Metadata = {
  title: 'Clean Air Network | AirQo Africa',
  description:
    'Join the Clean Air Network by AirQo, connecting stakeholders and promoting actions to improve air quality across Africa. Explore events, resources, and membership opportunities.',
  keywords:
    'Clean Air Network, AirQo Africa, air quality network, air quality stakeholders, air pollution, environmental health, clean air Africa, air quality events, air quality resources, air quality membership',
  openGraph: {
    title: 'Clean Air Network - AirQo Africa',
    description:
      'Explore the Clean Air Network by AirQo, a platform for connecting stakeholders, accessing resources, and participating in events focused on improving air quality in Africa.',
    url: 'https://yourdomain.com/clean-air-network',
    siteName: 'AirQo',
    images: [
      {
        url: 'https://yourdomain.com/static/clean-air-network-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Clean Air Network - Connecting Stakeholders for Cleaner Air',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQo',
    title: 'Clean Air Network - AirQo Africa',
    description:
      'Join AirQo’s Clean Air Network to connect with stakeholders and participate in discussions aimed at improving air quality across Africa.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://yourdomain.com/clean-air-network', // Replace with your actual domain
  },
};

type CleanAirLayoutProps = {
  children: React.ReactNode;
};

const CleanAirLayout: React.FC<CleanAirLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pb-8">{children}</main>

      {/* Action Buttons Section */}
      <section className="my-16">
        <ActionButtons2 />
      </section>

      {/* Footer */}
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default CleanAirLayout;
