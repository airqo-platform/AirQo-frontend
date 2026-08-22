'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProfileForm, SecurityTab, OrgInvitesTab } from './components';
import { ApiClientPage } from '../api-client';
import ThemeManager from '../themes/components/ThemeManager';
import { BillingPage } from '../billing';
import {
  AqUserCircle,
  AqLock02,
  AqKey01,
  AqPalette,
  AqCreditCard01,
} from '@airqo/icons-react';
import { Card, LoadingSpinner } from '@/shared/components/ui';
import { AiDrawerTrigger } from '@/modules/ai/components/AiDrawerTrigger';

interface ExtendedSessionUser {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const TAB_PARAM_MAP: Record<string, number> = {
  profile: 0,
  security: 1,
  api: 2,
  subscription: 3,
  'org-invites': 4,
  theme: 5,
};

const TAB_ID_TO_PARAM: Record<number, string> = Object.fromEntries(
  Object.entries(TAB_PARAM_MAP).map(([param, id]) => [id, param])
);

const ProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam && tabParam in TAB_PARAM_MAP ? TAB_PARAM_MAP[tabParam] : 0;
  });

  const userId = (session?.user as ExtendedSessionUser)?._id;

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam in TAB_PARAM_MAP) {
      setActiveTab(TAB_PARAM_MAP[tabParam]);
    }
  }, [searchParams]);

  const navigateToTab = useCallback(
    (tabId: number) => {
      setActiveTab(tabId);
      const param = TAB_ID_TO_PARAM[tabId];
      if (param && searchParams.get('tab') !== param) {
        router.replace(`?tab=${param}`, { scroll: false });
      }
    },
    [router, searchParams]
  );

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
    { id: 2, title: 'API', component: () => <ApiClientPage /> },
    { id: 3, title: 'Subscription', component: () => <BillingPage /> },
    { id: 4, title: 'Team Invites', component: () => <OrgInvitesTab /> },
    { id: 5, title: 'Theme', component: () => <ThemeManager /> },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-end mb-4">
        <AiDrawerTrigger />
      </div>
      {/* Tab Navigation */}
      <Card className="mb-6">
        <nav className="flex overflow-x-auto scrollbar-hide px-4 sm:px-6">
          <div className="flex space-x-4 sm:space-x-8 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => tab.component && navigateToTab(tab.id)}
                disabled={!tab.component}
                className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                } ${!tab.component ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <span className="flex gap-1.5 sm:gap-2 items-center">
                  {tab.id === 0 && (
                    <AqUserCircle size={14} className="sm:w-4 sm:h-4" />
                  )}
                  {tab.id === 1 && (
                    <AqLock02 size={14} className="sm:w-4 sm:h-4" />
                  )}
                  {tab.id === 2 && (
                    <AqKey01 size={14} className="sm:w-4 sm:h-4" />
                  )}
                  {tab.id === 3 && (
                    <AqCreditCard01 size={14} className="sm:w-4 sm:h-4" />
                  )}
                  {tab.id === 4 && (
                    <AqUserCircle size={14} className="sm:w-4 sm:h-4" />
                  )}
                  {tab.id === 5 && (
                    <AqPalette size={14} className="sm:w-4 sm:h-4" />
                  )}
                  {tab.title}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </Card>

      {/* Tab Content */}
      <div>{tabs.find(tab => tab.id === activeTab)?.component?.()}</div>
    </div>
  );
};

export default ProfilePage;
