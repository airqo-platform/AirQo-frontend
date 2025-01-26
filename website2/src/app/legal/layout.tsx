import { Metadata } from 'next';
import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';
import mainConfig from '@/configs/mainConfigs';
import TabSection from '@/views/legal/Tabsection';

export const metadata: Metadata = {
  title: 'Legal Information | AirQo',
  description:
    'Review AirQo’s legal policies including Privacy Policy, Terms of Service, and other important legal documentation regarding the use of our air quality services.',
  keywords:
    'AirQo legal information, Privacy Policy, Terms of Service, legal documentation, data policy, air quality services, AirQo policies',
  openGraph: {
    title: 'Legal Information - AirQo',
    description:
      'Access AirQo’s legal documents including Privacy Policy, Terms of Service, and other important legal information for our air quality services.',
    url: 'https://yourdomain.com/legal',
    siteName: 'AirQo',
    images: [
      {
        url: 'https://yourdomain.com/static/legal-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Legal Information - Privacy Policy, Terms of Service',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQo',
    title: 'AirQo Legal Information',
    description:
      'Read AirQo’s legal documentation including Privacy Policy, Terms of Service, and other legal guidelines for using our air quality services.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://yourdomain.com/legal',
  },
};

type LegalPageLayoutProps = {
  children: React.ReactNode;
};

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ children }) => {
  return (
    <MainLayout>
      <TabSection />
      <main className={`${mainConfig.containerClass} legal-page-content`}>
        {children}
      </main>
    </MainLayout>
  );
};

export default LegalPageLayout;
