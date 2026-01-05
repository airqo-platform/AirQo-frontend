import type { Metadata } from 'next';
import type React from 'react';

import MainLayout from '@/components/layouts/MainLayout';
import mainConfig from '@/configs/mainConfigs';
import TabSection from '@/views/legal/Tabsection';

export const metadata: Metadata = {
  title: {
    template: '%s | AirQo Legal',
    default: 'Legal Information & Policies | AirQo',
  },
  description:
    "Access AirQo's comprehensive legal documentation, including Privacy Policy, Terms of Service, Data Usage Policy, and Payment Terms. Find detailed information about your rights and our obligations regarding air quality monitoring services.",
  keywords:
    'AirQo legal information, privacy policy, terms of service, data policy, payment terms, refund policy, air quality services terms, AirQo policies, legal documentation, user rights, data protection policy, service agreements',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    'max-snippet': 170,
  },
  other: {
    'revisit-after': '30 days',
    'dc.type': 'Legal Document',
    'dc.language': 'en',
    'dc.rights': 'Copyright AirQo, All Rights Reserved',
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
