'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui';
import SubscriptionSection from './components/SubscriptionSection';
import TransactionHistory from './components/TransactionHistory';
import SubscriptionManagement from './components/SubscriptionManagement';
import BillingInformation from './components/BillingInformation';

const BillingPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'plans' | 'subscription' | 'billing'
  >('plans');

  const subTabs = [
    { id: 'plans' as const, label: 'Plans & Pricing' },
    { id: 'subscription' as const, label: 'Subscription' },
    { id: 'billing' as const, label: 'Billing Info' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <Card className="p-1">
        <div className="flex space-x-1">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeSubTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Sub-tab Content */}
      {activeSubTab === 'plans' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Billing & Payments
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your subscription, view payment history, and monitor API
              usage
            </p>
          </div>

          <SubscriptionSection />

          <TransactionHistory />
        </div>
      )}

      {activeSubTab === 'subscription' && <SubscriptionManagement />}

      {activeSubTab === 'billing' && <BillingInformation />}
    </div>
  );
};

export default BillingPage;
