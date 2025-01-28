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
