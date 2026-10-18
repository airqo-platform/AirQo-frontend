'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SubscriptionSection from './components/SubscriptionSection';
import TransactionHistory from './components/TransactionHistory';
import UsageStats from './components/UsageStats';
import {
  Card,
  SegmentedTabs,
  type SegmentedTabOption,
} from '@/shared/components/ui';
import {
  AqAlertTriangle,
  AqBarChartSquareUp,
  AqCheckCircle,
  AqCreditCard01,
  AqReceipt,
} from '@airqo/icons-react';

type BillingSubTab = 'subscription' | 'usage' | 'transactions';

const BillingPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [activeSubTab, setActiveSubTab] = useState<BillingSubTab>(
    'subscription'
  );

  const checkoutState = searchParams.get('checkout');

  const checkoutBanner = useMemo(() => {
    if (checkoutState === 'success') {
      return {
        tone: 'success' as const,
        title: 'Payment completed',
        message: 'Your subscription details are updating now.',
      };
    }

    if (checkoutState === 'cancel') {
      return {
        tone: 'warning' as const,
        title: 'Checkout not completed',
        message: 'You can restart whenever you are ready.',
      };
    }

    return null;
  }, [checkoutState]);

  const subTabs: SegmentedTabOption<BillingSubTab>[] = useMemo(
    () => [
      {
        value: 'subscription',
        label: 'Subscription & Tiers',
        icon: <AqCreditCard01 />,
      },
      {
        value: 'usage',
        label: 'Usage & Limits',
        icon: <AqBarChartSquareUp />,
      },
      {
        value: 'transactions',
        label: 'Transactions',
        icon: <AqReceipt />,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Subscription & Billing
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Review your current plan, switch tiers, and monitor API usage from one
          place.
        </p>
      </div>

      {/* Checkout status banner */}
      {checkoutBanner && (
        <Card
          className={`flex items-start gap-3 border px-5 py-4 ${
            checkoutBanner.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/30'
              : 'border-amber-200 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/30'
          }`}
        >
          {checkoutBanner.tone === 'success' ? (
            <AqCheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AqAlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          )}
          <div className="min-w-0">
            <p
              className={`text-sm font-medium ${
                checkoutBanner.tone === 'success'
                  ? 'text-emerald-800 dark:text-emerald-200'
                  : 'text-amber-800 dark:text-amber-200'
              }`}
            >
              {checkoutBanner.title}
            </p>
            <p
              className={`mt-0.5 text-sm ${
                checkoutBanner.tone === 'success'
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-amber-700 dark:text-amber-300'
              }`}
            >
              {checkoutBanner.message}
            </p>
          </div>
        </Card>
      )}

      {/* Section tabs */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1 sm:mx-0 sm:px-0">
        <SegmentedTabs
          options={subTabs}
          value={activeSubTab}
          onChange={setActiveSubTab}
          ariaLabel="Billing sections"
          size="md"
        />
      </div>

      {/* Tab content */}
      {activeSubTab === 'subscription' && <SubscriptionSection />}
      {activeSubTab === 'usage' && <UsageStats />}
      {activeSubTab === 'transactions' && <TransactionHistory />}
    </div>
  );
};

export default BillingPage;
