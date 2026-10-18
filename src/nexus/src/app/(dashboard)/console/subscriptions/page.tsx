import React from 'react';
import { Metadata } from 'next';
import BillingPage from '@/modules/billing/BillingPage';

export const metadata: Metadata = {
  title: 'Subscriptions',
  description:
    'Review your current plan, switch tiers, and monitor billing and transactions.',
};

const Page = () => {
  return <BillingPage />;
};

export default Page;
