'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SubscriptionSection from './components/SubscriptionSection';
import TransactionHistory from './components/TransactionHistory';
import { Card } from '@/shared/components/ui';

const BillingPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [activeSubTab, setActiveSubTab] = useState<
    'subscription' | 'transactions'
  >('subscription');

  const checkoutState = searchParams.get('checkout');

  const checkoutBanner = useMemo(() => {
    if (checkoutState === 'success') {
      return {
        className:
          'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200',
        text: 'Payment completed. Your subscription details are syncing now.',
      };
    }

    if (checkoutState === 'cancel') {
      return {
        className:
          'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200',
        text: 'Checkout was canceled. You can resume anytime from this page.',
      };
    }

    return null;
  }, [checkoutState]);

  const subTabs = [
    { id: 'subscription' as const, label: 'Subscription & Tiers' },
    { id: 'transactions' as const, label: 'Transactions' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Subscription & Access
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your API tier, renewal preferences, and billing transactions.
        </p>
      </div>

      {checkoutBanner && (
        <Card className={`p-4 border ${checkoutBanner.className}`}>
          <p className="text-sm">{checkoutBanner.text}</p>
        </Card>
      )}

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-6" aria-label="Billing sections">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`py-2.5 px-1 text-sm font-medium border-b-2 transition-colors ${
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

      {activeSubTab === 'subscription' && <SubscriptionSection />}
      {activeSubTab === 'transactions' && <TransactionHistory />}
    </div>
  );
};

export default BillingPage;
