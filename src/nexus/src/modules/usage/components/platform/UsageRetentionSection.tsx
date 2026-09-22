'use client';

import React from 'react';
import { Card } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui';
import { EmptyState } from '@/shared/components/ui';
import {
  retentionCellView,
  retentionColorClass,
} from '@/modules/usage/utils/format';
import UsageSectionError from '@/modules/usage/components/platform/UsageSectionError';
import type { UsageRetentionResponse } from '@/shared/types/usage';

/**
 * Retention section — cohort rows with a triangular matrix of retention cells.
 * A null rate is rendered as "—" (no data), not 0%, because 0% and
 * "we don't know" are different states. Color intensity encodes magnitude but
 * the numeric label is always present, so meaning is never color-only.
 */
export interface UsageRetentionSectionProps {
  data: UsageRetentionResponse | null;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

const UsageRetentionSection: React.FC<UsageRetentionSectionProps> = ({
  data,
  isLoading,
  error,
  onRetry,
}) => {
  if (isLoading && !data) {
    return (
      <LoadingState text="Loading retention..." className="min-h-[160px]" />
    );
  }

  if (error && !data) {
    return (
      <UsageSectionError
        title="Failed to load retention"
        message={error.message || 'An unexpected error occurred.'}
        onRetry={onRetry}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No retention data yet"
        description="Cohort retention appears after the first full lifecycle month."
      />
    );
  }

  const cohorts = data.cohorts ?? [];
  const maxOffset =
    cohorts.reduce((max, c) => Math.max(max, c.retention?.length ?? 0), 0) - 1;

  if (cohorts.length === 0) {
    return (
      <EmptyState
        title="No cohorts for this period"
        description="Retention cohorts will appear once enough months have elapsed."
        compact
      />
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Cohort Retention
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Percent of users from each cohort who returned in subsequent months.{' '}
          {data.cohort_basis ? `(${data.cohort_basis})` : ''}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
              <th scope="col" className="py-2 pr-4 font-semibold">
                Cohort
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Size
              </th>
              {Array.from({ length: maxOffset + 1 }, (_, i) => (
                <th
                  key={i}
                  scope="col"
                  className="py-2 pr-4 font-semibold text-center"
                >
                  M+{i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cohorts.map(cohort => (
              <tr key={cohort.cohort} className="hover:bg-muted/30">
                <td className="py-2 pr-4 font-medium tabular-nums whitespace-nowrap">
                  {cohort.cohort}
                </td>
                <td className="py-2 pr-4 tabular-nums text-muted-foreground">
                  {cohort.size}
                </td>
                {Array.from({ length: maxOffset + 1 }, (_, offsetIdx) => {
                  const cell = cohort.retention?.[offsetIdx];
                  const view = retentionCellView(
                    offsetIdx,
                    cohort.size,
                    cell?.rate_pct
                  );
                  // M+0 (the acquisition month) is the baseline cohort size;
                  // render it distinctly to avoid implying 100% "retention".
                  return (
                    <td key={offsetIdx} className="py-2 pr-4 text-center">
                      <span
                        role="img"
                        aria-label={view.label}
                        title={view.label}
                        className={`inline-flex min-w-[52px] items-center justify-center rounded px-2 py-1 text-xs font-medium tabular-nums ${view.isBaseline ? 'bg-muted/50 text-foreground' : retentionColorClass(cell?.rate_pct)}`}
                      >
                        {view.text}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default UsageRetentionSection;
