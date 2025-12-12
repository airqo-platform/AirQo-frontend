'use client';

import React from 'react';
import { Card } from '@/shared/components/ui';
import SubscriptionSection from './components/SubscriptionSection';
import TransactionHistory from './components/TransactionHistory';

const BillingModule: React.FC = () => {
  return (
    <div className="space-y-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Billing & payments
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your subscription and view payment history
            </p>
          </div>
        </div>

        <SubscriptionSection />
      </Card>

      <TransactionHistory />
    </div>
  );
};

export default BillingModule;
