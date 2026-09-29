import React from 'react';
import { Card } from '@/shared/components/ui';
import { MetricCard, SegmentedTabs } from '@/shared/components/ui';
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

  const bucket =
    buckets.find(b => b.currency === currency) ??
    buckets.find(b => b.currency === currency) ??
    buckets[0];

  if (!summary || buckets.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          No billing data available for the selected period.
        </p>
      </Card>
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
            value={currency}
            onChange={onCurrencyChange}
            ariaLabel="Currency"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Outstanding"
          value={formatMoney(bucket?.outstanding_amount, currency)}
          hint={
            <span className="text-xs text-muted-foreground">
              {bucket?.outstanding_count ?? 0} invoice
              {bucket?.outstanding_count === 1 ? '' : 's'}
            </span>
          }
        />
        <MetricCard
          label="Overdue"
          value={formatMoney(bucket?.overdue_amount, currency)}
          hint={
            <span className="text-xs text-muted-foreground">
              {bucket?.overdue_count ?? 0} invoice
              {bucket?.overdue_count === 1 ? '' : 's'}
            </span>
          }
        />
        <MetricCard
          label="Invoiced (period)"
          value={formatMoney(bucket?.invoiced_amount, currency)}
          hint={
            <span className="text-xs text-muted-foreground">{`${summary.from ?? '—'} → ${summary.to ?? '—'}`}</span>
          }
        />
        <MetricCard
          label="Collected (period)"
          value={formatMoney(bucket?.collected_amount, currency)}
        />
      </div>

      {isLoading && (
        <p className="text-xs text-muted-foreground">Refreshing…</p>
      )}
    </div>
  );
};

export default SummaryTiles;
