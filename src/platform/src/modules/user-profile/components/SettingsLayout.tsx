'use client';

import React from 'react';
import { Card, CardContent } from '@/shared/components/ui';

interface SettingsLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  infoSection?: React.ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  title,
  description,
  children,
  infoSection,
}) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Left Section - Title and Description */}
          <div className="lg:col-span-1 p-6 bg-gray-50 dark:bg-[#1d1f20] border-r border-gray-200 dark:border-gray-700">
            <div className="sticky top-6">
              <h2 className="text-xl  dark:text-white mb-3">{title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                {description}
              </p>
              {infoSection && <div className="mt-4">{infoSection}</div>}
            </div>
          </div>

          {/* Right Section - Form Content */}
          <div className="lg:col-span-2 p-6">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsLayout;
