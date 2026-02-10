'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { ProfileForm, SecurityTab, OrgInvitesTab } from './components';
import { ApiClientPage } from '../api-client';
import ThemeManager from '../themes/components/ThemeManager';
import {
  AqUserCircle,
  AqLock02,
  AqKey01,
  AqPalette,
  AqMail04,
} from '@airqo/icons-react';
import { Card, LoadingSpinner } from '@/shared/components/ui';

interface ExtendedSessionUser {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const ProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);

  const userId = (session?.user as ExtendedSessionUser)?._id;

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'org-invites') {
      setActiveTab(2); // Org Invites tab
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size={48} className="mx-auto mb-4" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading user data...
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 0,
      title: 'Profile',
      component: userId ? () => <ProfileForm userId={userId} /> : null,
    },
    { id: 1, title: 'Security', component: () => <SecurityTab /> },
    { id: 2, title: 'Org Invites', component: () => <OrgInvitesTab /> },
    { id: 3, title: 'API', component: () => <ApiClientPage /> },
    { id: 4, title: 'Theme', component: () => <ThemeManager /> },
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <Card className="mb-6">
        <nav className="flex space-x-8 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => tab.component && setActiveTab(tab.id)}
              disabled={!tab.component}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              } ${!tab.component ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <span className="flex gap-2 items-center">
                {tab.id === 0 && <AqUserCircle size={16} />}
                {tab.id === 1 && <AqLock02 size={16} />}
                {tab.id === 2 && <AqMail04 size={16} />}
                {tab.id === 3 && <AqKey01 size={16} />}
                {tab.id === 4 && <AqPalette size={16} />}
                {tab.title}
              </span>
            </button>
          ))}
        </nav>
      </Card>

      {/* Tab Content */}
      <div>{tabs.find(tab => tab.id === activeTab)?.component?.()}</div>
    </div>
  );
};

export default ProfilePage;
