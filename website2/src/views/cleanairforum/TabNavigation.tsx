'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';

const tabs = [
  { label: 'About', value: '/clean-air-network' },
  { label: 'Membership', value: '/clean-air-network/membership' },
  { label: 'Events', value: '/clean-air-network/events' },
  { label: 'Resources', value: '/clean-air-network/resources' },
];

const TabNavigation: React.FC = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  return (
    <nav className="border-y pt-4 overflow-x-auto bg-white border-gray-200">
      <div className="flex space-x-8 max-w-5xl mx-auto px-4 lg:px-0">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`pb-2 text-[14px] font-normal transition-colors duration-300 ${
              activeTab === tab.value
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
