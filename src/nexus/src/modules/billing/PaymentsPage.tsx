'use client';

import React from 'react';
import { PageHeading } from '@/shared/components/ui';
import TransactionHistory from './components/TransactionHistory';
import SubscriptionSection from './components/SubscriptionSection';

const PaymentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Billing & Payments"
        subtitle="Manage your subscription, payment methods, and view transaction history"
      />
      <SubscriptionSection />
      <TransactionHistory />
    </div>
  );
};

export default PaymentsPage;
