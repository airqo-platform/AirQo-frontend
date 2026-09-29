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
  SegmentedTabs,
  type SegmentedTabOption,
} from '@/shared/components/ui/segmented-tabs';
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
    <nav aria-label="Billing sections" className="w-full min-w-0">
      {/* Horizontal scroll keeps every section reachable on narrow screens
          without the control growing past the viewport. */}
      <div className="max-w-full overflow-x-auto pb-1">
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
  );
};

export default BillingSubnav;
