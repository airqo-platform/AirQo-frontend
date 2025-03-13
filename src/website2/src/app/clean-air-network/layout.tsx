import { Metadata } from 'next';
import React from 'react';

import ActionButtons2 from '@/components/layouts/ActionButtons2';
import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/Navbar';

export const metadata: Metadata = {
  title: {
    template: '%s | Clean Air Network - AirQo',
    default: 'Clean Air Network | Advancing Air Quality in Africa',
  },
  description:
    "Join AirQo's Clean Air Network, a collaborative platform uniting researchers, policymakers, and communities to improve air quality across Africa. Access resources, events, and initiatives driving positive environmental change.",
  keywords:
    'Clean Air Network, AirQo Africa, air quality initiatives, environmental collaboration, air pollution solutions, African air quality, environmental network, clean air advocacy, air quality stakeholders, environmental partnerships Africa',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    'max-snippet': 170,
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
