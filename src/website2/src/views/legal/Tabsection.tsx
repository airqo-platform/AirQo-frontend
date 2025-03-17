'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';

import mainConfig from '@/configs/mainConfigs';

interface Tab {
  label: string;
  value: string;
}

const tabs: Tab[] = [
  { label: 'Terms of Service', value: 'terms-of-service' },
  { label: 'Privacy Policy', value: 'privacy-policy' },
  { label: 'AirQo Data', value: 'airqo-data' },
  { label: 'Payment Terms & Refund Policy', value: 'payment-refund-policy' },
];

const TabSection: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="w-full bg-[#F2F1F6] pt-16 h-[250px] px-4 lg:px-0">
      <div
        className={`w-full h-full flex flex-col justify-between items-start ${mainConfig.containerClass}`}
      >
        <div></div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-6">Legal Information</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto w-full space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/legal/${tab.value}`}
              className={`pb-2 text-sm font-medium transition-colors duration-200 ${
                pathname.includes(tab.value)
                  ? 'text-black border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabSection;
