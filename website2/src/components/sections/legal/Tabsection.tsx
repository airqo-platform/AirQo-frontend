'use client';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

const TabSection = () => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { label: 'Terms of Service', value: 'terms-of-service' },
    { label: 'Privacy Policy', value: 'privacy-policy' },
    { label: 'AirQo Data', value: 'airqo-data' },
    { label: 'Payment Terms & Refund Policy', value: 'payment-refund-policy' },
  ];

  const handleTabClick = (value: string) => {
    router.push(`/legal/${value}`);
  };

  return (
    <div className="w-full bg-[#F2F1F6]  pt-16 h-[250px] px-4 lg:px-0">
      <div className="w-full h-full flex flex-col justify-between items-start max-w-5xl mx-auto">
        <div></div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-6">Legal Information</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto w-full space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className={`pb-2 text-sm font-medium ${
                pathname.includes(tab.value)
                  ? 'text-black border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabSection;
