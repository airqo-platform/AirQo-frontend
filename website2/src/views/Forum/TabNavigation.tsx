'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const TabNavigation: React.FC = () => {
  const pathname = usePathname();

  // Function to check if the tab is active based on the current pathname.
  const isActiveTab = (path: string) => pathname === path;

  // Define the tabs list.
  const tabs = [
    { href: '/clean-air-forum/about', text: 'About' },
    { href: '/clean-air-forum/program-committee', text: 'Programme Committee' },
    { href: '/clean-air-forum/sessions', text: 'Call for Sessions' },
    { href: '/clean-air-forum/speakers', text: 'Speakers' },
    { href: '/clean-air-forum/partners', text: 'Partners' },
    { href: '/clean-air-forum/sponsorships', text: 'Sponsorships' },
    { href: '/clean-air-forum/logistics', text: 'Travel Logistics' },
    { href: '/clean-air-forum/glossary', text: 'Glossary' },
    { href: '/clean-air-forum/resources', text: 'Resources' },
  ];

  return (
    <div className="w-full py-10">
      <div className="w-full bg-gray-50 py-4 overflow-x-auto">
        <div className="max-w-5xl mx-auto flex flex-nowrap items-center space-x-6 px-4 lg:px-0">
          {tabs.map((link, index) => (
            <Link
              key={index}
              href={link.href}
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
