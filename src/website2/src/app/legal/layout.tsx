'use client';

import { usePathname } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';

import MainLayout from '@/components/layouts/MainLayout';
import mainConfig from '@/configs/mainConfigs';
import AirQoDataPage from '@/views/legal/AirQoDataPage';
import PP_Page from '@/views/legal/PP_Page';
import PRP_Page from '@/views/legal/PRP_Page';
import TabSection from '@/views/legal/Tabsection';
import TOSPage from '@/views/legal/TOSPage';

const LegalPageLayout: React.FC = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (pathname.includes('terms-of-service')) setActiveTab('terms-of-service');
    else if (pathname.includes('privacy-policy'))
      setActiveTab('privacy-policy');
    else if (pathname.includes('airqo-data')) setActiveTab('airqo-data');
    else if (pathname.includes('payment-refund-policy'))
      setActiveTab('payment-refund-policy');
    else setActiveTab('terms-of-service'); // default
  }, [pathname]);

  const renderContent = () => {
    switch (activeTab) {
      case 'privacy-policy':
        return <PP_Page />;
      case 'terms-of-service':
        return <TOSPage />;
      case 'airqo-data':
        return <AirQoDataPage />;
      case 'payment-refund-policy':
        return <PRP_Page />;
      default:
        return <TOSPage />;
    }
  };

  return (
    <MainLayout>
      <TabSection onTabChange={setActiveTab} />
      <main className={`${mainConfig.containerClass} legal-page-content`}>
        {renderContent()}
      </main>
    </MainLayout>
  );
};

export default LegalPageLayout;
