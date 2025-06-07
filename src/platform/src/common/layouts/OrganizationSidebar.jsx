'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useOrganization } from '@/app/providers/OrganizationProvider';
import { FaHome, FaLightbulb, FaUserCog } from 'react-icons/fa';

export default function OrganizationSidebar({ organization }) {
  const { primaryColor } = useOrganization();
  const params = useParams();
  const pathname = usePathname();

  const orgSlug = params?.org_slug || '';
  const navigationItems = [
    {
      name: 'Dashboard',
      href: `/org/${orgSlug}/dashboard`,
      icon: FaHome,
      description: 'Organization overview and metrics',
    },
    {
      name: 'Data Insights',
      href: `/org/${orgSlug}/insights`,
      icon: FaLightbulb,
      description: 'Air quality analytics and trends',
    },
    {
      name: 'Preferences',
      href: `/org/${orgSlug}/preferences`,
      icon: FaUserCog,
      description: 'Organization settings and preferences',
    },
  ];

  const isActiveLink = (href) => {
    return pathname.startsWith(href);
  };

  return (
    <nav className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="flex flex-col h-full">
        {/* Organization Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            <p>Organization</p>
            <p className="font-medium text-gray-900 truncate">
              {organization?.name}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveLink(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                  ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
                style={{
                  backgroundColor: isActive ? primaryColor : 'transparent',
                }}
              >
                <Icon
                  className={`
                    mr-3 flex-shrink-0 h-5 w-5
                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                />
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <span
                    className={`text-xs ${isActive ? 'text-gray-200' : 'text-gray-500'}`}
                  >
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Organization Branding */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center text-xs text-gray-500">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: primaryColor }}
            />
            <span>Powered by AirQo</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
