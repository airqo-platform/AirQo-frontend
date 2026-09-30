'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  AqCreditCard01,
  AqPresentationChart02,
  AqReceipt,
  AqSettings01,
  AqUsers01,
} from '@airqo/icons-react';
import {
  Card,
  SegmentedTabs,
  type SegmentedTabOption,
} from '@/shared/components/ui';
import { BILLING_NAV } from '../constants';

type BillingSection = keyof typeof BILLING_NAV;

const SECTION_ORDER: BillingSection[] = [
  'dashboard',
  'invoices',
  'customers',
  'payments',
  'settings',
];

const SECTION_META: Record<
  BillingSection,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  dashboard: { label: 'Dashboard', Icon: AqPresentationChart02 },
  invoices: { label: 'Invoices', Icon: AqReceipt },
  customers: { label: 'Customers', Icon: AqUsers01 },
  payments: { label: 'Payments', Icon: AqCreditCard01 },
  settings: { label: 'Settings', Icon: AqSettings01 },
};

/** Longest-prefix match so `/system/billing/invoices/new` still reads as Invoices. */
const resolveSection = (pathname: string): BillingSection => {
  const match = SECTION_ORDER.filter(
    key =>
      pathname === BILLING_NAV[key] ||
      pathname.startsWith(`${BILLING_NAV[key]}/`)
  ).sort((a, b) => BILLING_NAV[b].length - BILLING_NAV[a].length)[0];

  return match ?? 'dashboard';
};

const BillingSubnav: React.FC = () => {
  const pathname = usePathname();

  const options = useMemo<SegmentedTabOption<BillingSection>[]>(
    () =>
      SECTION_ORDER.map(key => {
        const { Icon } = SECTION_META[key];
        return {
          value: key,
          label: SECTION_META[key].label,
          icon: <Icon />,
        };
      }),
    []
  );

  return (
    <Card className="w-full min-w-0 border border-border/70 p-2 shadow-sm sm:p-3">
      <nav aria-label="Billing sections" className="w-full min-w-0">
        {/* Horizontal scroll keeps every section reachable on narrow screens
            without the control growing past the viewport. The thin scrollbar
            doubles as the affordance that there is more to the right. */}
        <div className="max-w-full overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:rounded-full [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
          <SegmentedTabs
            options={options}
            value={resolveSection(pathname)}
            getHref={section => BILLING_NAV[section]}
            ariaLabel="Billing sections"
            size="md"
            className="min-w-max"
          />
        </div>
      </nav>
    </Card>
  );
};

export default BillingSubnav;
