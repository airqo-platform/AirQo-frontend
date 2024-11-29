'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const TabNavigation = () => {
  const pathname = usePathname();

  // Function to check if the tab is active based on the current pathname
  const isActiveTab = (path: string) => pathname === path;

  return (
    <div className="w-full py-10">
      <div className="w-full bg-gray-50 py-4 overflow-x-auto">
        <div className="max-w-5xl mx-auto flex justify-between min-w-[920px] px-4 lg:px-0 items-center space-y-4 md:space-y-0">
          {[
            { href: '/clean-air-forum', text: 'About' },
            {
              href: '/clean-air-forum/program-committee',
              text: 'Programme Committee',
            },
            {
              href: '/clean-air-forum/schedule',
              text: 'Schedule & Registration',
            },
            { href: '/clean-air-forum/speakers', text: 'Speakers' },
            { href: '/clean-air-forum/partners', text: 'Partners' },
            { href: '/clean-air-forum/logistics', text: 'Travel Logistics' },
            { href: '/clean-air-forum/glossary', text: 'Glossary' },
            { href: '/clean-air-forum/resources', text: 'Resources' },
          ].map((link, index) => (
            <Link key={index} href={link.href}>
              <span
                className={`relative text-gray-700 hover:text-gray-900 transition ${
                  isActiveTab(link.href)
                    ? 'font-semibold text-gray-900'
                    : 'text-gray-700'
                }`}
              >
                {link.text}
                {isActiveTab(link.href) && (
                  <span className="absolute left-0 -bottom-[18px] h-[2px] w-full bg-gray-900" />
                )}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
