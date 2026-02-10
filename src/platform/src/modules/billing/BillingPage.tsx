'use client';

import React, { useState } from 'react';
import SubscriptionSection from './components/SubscriptionSection';
import TransactionHistory from './components/TransactionHistory';
import BillingInformation from './components/BillingInformation';

const BillingPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'plans' | 'billing'>(
    'plans'
  );

  const subTabs = [
    { id: 'plans' as const, label: 'Plans & Pricing' },
    { id: 'billing' as const, label: 'Billing Info' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeSubTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

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

      {activeSubTab === 'billing' && <BillingInformation />}
    </div>
  );
};

export default BillingPage;
