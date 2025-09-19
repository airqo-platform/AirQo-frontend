// components/layouts/TabNavigation.tsx
'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import React from 'react';

const TabNavigation: React.FC = () => {
  const pathname = usePathname();
  const params = useParams();

  // Get the uniqueTitle from the current URL params
  const uniqueTitle = params.uniqueTitle as string;

  // Function to check if the tab is active based on the current pathname.
  const isActiveTab = (path: string) => {
    if (!uniqueTitle) return pathname === path || pathname.startsWith(path);

    // Build the full path with uniqueTitle and check if current path ends with the target path
    const fullPath = `/clean-air-forum/${uniqueTitle}${path}`;
    return pathname === fullPath;
  };

  // Define the tabs list.
  const tabs = [
    { href: '/about', text: 'About' },
    { href: '/program-committee', text: 'Programme Committee' },
    { href: '/sessions', text: 'Schedule' },
    { href: '/speakers', text: 'Speakers' },
    { href: '/partners', text: 'Partners' },
    { href: '/sponsorships', text: 'Sponsorships' },
    { href: '/logistics', text: 'Travel Logistics' },
    { href: '/glossary', text: 'Glossary' },
    { href: '/resources', text: 'Resources' },
  ];

  // Build href with uniqueTitle if it exists
  const buildHref = (href: string) => {
    if (uniqueTitle) {
      return `/clean-air-forum/${uniqueTitle}${href}`;
    }
    return `/clean-air-forum${href}`;
  };

  return (
    <div className="w-full py-10">
      <div className="w-full bg-gray-50 py-4 overflow-x-auto">
        <div className="max-w-5xl mx-auto flex flex-nowrap items-center space-x-6 px-4 lg:px-0">
          {tabs.map((link, index) => (
            <Link
              key={index}
              href={buildHref(link.href)}
              className={`relative flex-shrink-0 no-underline text-gray-700 hover:text-gray-900 transition ${
                isActiveTab(link.href) ? 'font-semibold text-gray-900' : ''
              }`}
            >
              {link.text}
              {isActiveTab(link.href) && (
                <span className="absolute left-0 -bottom-2 h-[2px] w-full bg-gray-900" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
