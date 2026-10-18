import React, { Suspense } from 'react';
import { Metadata } from 'next';
import BillingPage from '@/modules/billing/BillingPage';
import { LoadingState } from '@/shared/components/ui';

export const metadata: Metadata = {
  title: 'Subscriptions',
  description:
    'Review your current plan, switch tiers, and monitor billing and transactions.',
};

const Page = () => {
  return (
    <Suspense fallback={<LoadingState text="Loading subscriptions..." />}>
      <BillingPage />
    </Suspense>
  );
};

export default Page;
