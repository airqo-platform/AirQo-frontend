'use client';

import React, { useMemo } from 'react';
import { Card } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui';
import { EmptyState } from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import {
  retentionCellView,
  retentionColorClass,
} from '@/modules/usage/utils/format';
import UsageSectionError from '@/modules/usage/components/platform/UsageSectionError';
import type { UsageCohort, UsageRetentionResponse } from '@/shared/types/usage';

/** Stable no-op handler — see the controlled-search note on the table below. */
const noop = () => undefined;

/**
 * Retention section — cohort rows with a triangular matrix of retention cells.
 * A null rate is rendered as "—" (no data), not 0%, because 0% and
 * "we don't know" are different states. Color intensity encodes magnitude but
 * the numeric label is always present, so meaning is never color-only.
 *
 * Cohorts of size 0 carry no users and no meaningful retention signal, so they
 * are filtered out; if none remain the empty state is shown.
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
  const cohorts = useMemo(
    () => (data?.cohorts ?? []).filter(cohort => cohort.size > 0),
    [data]
  );
  const maxOffset = useMemo(
    () =>
      cohorts.reduce((max, c) => Math.max(max, c.retention?.length ?? 0), 0) -
      1,
    [cohorts]
  );

  // Cohort rows are ordered by acquisition month and the M+n offsets are
  // fixed by the backend — there is nothing meaningful to re-sort, so every
  // column is non-sortable (onSortChange can never fire).
  const columns = useMemo(
    () => [
      {
        key: 'cohort',
        label: 'Cohort',
        sortable: false,
        cellClassName: 'font-medium tabular-nums',
        render: (_value: unknown, cohort: UsageCohort) => cohort.cohort,
      },
      {
        key: 'size',
        label: 'Size',
        sortable: false,
        cellClassName: 'tabular-nums text-muted-foreground',
        render: (_value: unknown, cohort: UsageCohort) => String(cohort.size),
      },
      ...Array.from({ length: maxOffset + 1 }, (_, offsetIdx) => ({
        key: `m+${offsetIdx}`,
        label: `M+${offsetIdx}`,
        sortable: false as const,
        headerClassName: 'text-center',
        cellClassName: 'text-center',
        render: (_value: unknown, cohort: UsageCohort) => {
          const cell = cohort.retention?.[offsetIdx];
          const view = retentionCellView(
            offsetIdx,
            cohort.size,
            cell?.rate_pct
          );
          // M+0 (the acquisition month) is the baseline cohort size;
          // render it distinctly to avoid implying 100% "retention".
          return (
            <span
              role="img"
              aria-label={view.label}
              title={view.label}
              className={`inline-flex min-w-[52px] items-center justify-center rounded px-2 py-1 text-xs font-medium tabular-nums ${view.isBaseline ? 'bg-muted/50 text-foreground' : retentionColorClass(cell?.rate_pct)}`}
            >
              {view.text}
            </span>
          );
        },
      })),
    ],
    [maxOffset]
  );

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

      {/*
        Controlled search with the box hidden: this endpoint returns the full
        cohort set with no pagination, and without a controlled
        `onSearchChange` the shared table would silently render only its default
        first 10 rows. A search box over a handful of cohort rows is noise, so
        it stays hidden rather than becoming a control that has to work.
      */}
      <ServerSideTable
        data={cohorts.map(cohort => ({ ...cohort, id: cohort.cohort }))}
        columns={columns}
        searchable={false}
        searchTerm=""
        onSearchChange={noop}
      />
    </Card>
  );
};

export default UsageRetentionSection;
