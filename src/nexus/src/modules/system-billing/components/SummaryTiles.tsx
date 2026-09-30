import React from 'react';
import { EmptyState, MetricCard, SegmentedTabs } from '@/shared/components/ui';
import { AqWallet01 } from '@airqo/icons-react';
import type { BillingSummary } from '@/shared/types/billing';
import { formatMoney } from '../lib/format';

interface SummaryTilesProps {
  summary?: BillingSummary;
  isLoading?: boolean;
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

const SummaryTiles: React.FC<SummaryTilesProps> = ({
  summary,
  isLoading,
  currency,
  onCurrencyChange,
}) => {
  const buckets = summary?.buckets ?? [];
  const currencies = Array.from(
    new Set(
      buckets
        .map(b => (b.currency ? b.currency : null))
        .filter((c): c is string => Boolean(c))
    )
  );
  const hasMultipleCurrencies = currencies.length > 1;

  const bucket = buckets.find(b => b.currency === currency) ?? buckets[0];

  // Format with the currency of the bucket actually shown: when no bucket
  // matches (and the tabs are therefore hidden) the amounts would otherwise be
  // labelled with a currency the user cannot switch away from.
  const displayCurrency = bucket?.currency ?? currency;

  if (!summary || buckets.length === 0) {
    return (
      <EmptyState
        compact
        icon={<AqWallet01 />}
        title="No billing data for this period"
        description="Once invoices are issued in the selected date range, outstanding, overdue and collected totals appear here."
      />
    );
  }

  const currencyTabs = currencies.map(c => ({
    value: c,
    label: c,
  }));

  return (
    <div className="space-y-4">
      {hasMultipleCurrencies && (
        <div className="flex justify-end">
          <SegmentedTabs
            options={currencyTabs}
            value={displayCurrency}
            onChange={onCurrencyChange}
            ariaLabel="Currency"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Outstanding"
          value={formatMoney(bucket?.outstanding_amount, displayCurrency)}
          hint={
            <span className="text-xs text-muted-foreground">
              {bucket?.outstanding_count ?? 0} invoice
              {bucket?.outstanding_count === 1 ? '' : 's'}
            </span>
          }
        />
        <MetricCard
          label="Overdue"
          value={formatMoney(bucket?.overdue_amount, displayCurrency)}
          hint={
            <span className="text-xs text-muted-foreground">
              {bucket?.overdue_count ?? 0} invoice
              {bucket?.overdue_count === 1 ? '' : 's'}
            </span>
          }
        />
        <MetricCard
          label="Invoiced (period)"
          value={formatMoney(bucket?.invoiced_amount, displayCurrency)}
          hint={
            <span className="text-xs text-muted-foreground">{`${summary.from ?? '—'} → ${summary.to ?? '—'}`}</span>
          }
        />
        <MetricCard
          label="Collected (period)"
          value={formatMoney(bucket?.collected_amount, displayCurrency)}
        />
      </div>

      {isLoading && (
        <p className="text-xs text-muted-foreground">Refreshing…</p>
      )}
    </div>
  );
};

export default SummaryTiles;
