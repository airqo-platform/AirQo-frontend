'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AqPalette, AqSettings01 } from '@airqo/icons-react';
import { Card, LoadingSpinner } from '@/shared/components/ui';
import { AdminPageGuard } from '@/shared/components';
import ThemeSettings from '../components/ThemeSettings';
import GroupDetailsSettings from '../components/GroupDetailsSettings';

const OrganizationSettingsPage: React.FC = () => {
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState(0);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size={48} className="mx-auto mb-4" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 0,
      title: 'Theme',
      icon: AqPalette,
      component: () => <ThemeSettings />,
    },
    {
      id: 1,
      title: 'Group Details',
      icon: AqSettings01,
      component: () => <GroupDetailsSettings />,
    },
  ];

  return (
    <AdminPageGuard requiredPermissionsInActiveGroup={['GROUP_MANAGEMENT']}>
      <div>
        {/* Tab Navigation */}
        <Card className="mb-6">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                } cursor-pointer`}
              >
                <span className="flex gap-2 items-center">
                  <tab.icon size={16} />
                  {tab.title}
                </span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Tab Content */}
        <div>{tabs.find(tab => tab.id === activeTab)?.component?.()}</div>
      </div>
    </AdminPageGuard>
  );
};

export default OrganizationSettingsPage;
