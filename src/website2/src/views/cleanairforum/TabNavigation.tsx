'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';

import mainConfig from '@/configs/mainConfigs';

const tabs = [
  { label: 'About', value: '/clean-air-network' },
  { label: 'Membership', value: '/clean-air-network/membership' },
  { label: 'Events', value: '/clean-air-network/events' },
  { label: 'Resources', value: '/clean-air-network/resources' },
];

const TabNavigation: React.FC = () => {
  const pathname = usePathname();

  const isActiveTab = (tabValue: string) => {
    if (tabValue === '/clean-air-network') {
      return pathname === tabValue;
    }
    return pathname.startsWith(tabValue);
  };

  return (
    <nav className="border-y pt-4 overflow-x-auto bg-white border-gray-200">
      <div
        className={`flex space-x-8 ${mainConfig.containerClass} px-4 lg:px-0`}
      >
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value}
            className={`pb-2 text-[14px] font-normal transition-colors duration-300 ${
              isActiveTab(tab.value)
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default TabNavigation;
