'use client';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';

const TabNavigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  const tabs = [
    { label: 'About', value: '/clean-air-network' },
    { label: 'Membership', value: '/clean-air-network/membership' },
    { label: 'Events', value: '/clean-air-network/events' },
    { label: 'Resources', value: '/clean-air-network/resources' },
  ];

  const handleTabClick = (value: string) => {
    setActiveTab(value);
    router.push(value);
  };

  return (
    <div className="border-y pt-4 overflow-x-auto bg-white border-gray-200">
      <div className="flex space-x-8 max-w-5xl mx-auto px-4 lg:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={`pb-2 text-[14px] font-normal transition-colors duration-300 ${
              activeTab === tab.value
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
