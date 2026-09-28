'use client';

import React, { useMemo } from 'react';
import { Card } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui';
import { EmptyState } from '@/shared/components/ui';
import { SegmentedTabs } from '@/shared/components/ui';
import type { SegmentedTabOption } from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import {
  DASH,
  formatNumber,
  formatPercent,
  formatDurationSec,
} from '@/modules/usage/utils/format';
import UsageSectionError from '@/modules/usage/components/platform/UsageSectionError';
import type {
  UsageKind,
  UsagePagesItem,
  UsagePagesResponse,
} from '@/shared/types/usage';

/** Backend caps top-pages results at 50. */
export const USAGE_PAGES_LIMIT = 50;

/**
 * Pages/endpoints section. `kind` is controlled by the parent so it can live
 * alongside the shared filters. Data comes from `useUsagePages` via props.
 * The ranking is server-defined (top N by count), so the columns are not
 * sortable — the table is a read-only leaderboard rendered via the shared
 * ServerSideTable (columns sortable:false; no pagination props).
 */
export interface UsagePagesSectionProps {
  kind: UsageKind;
  onKindChange: (kind: UsageKind) => void;
  data: UsagePagesResponse | null;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

const kindOptions: SegmentedTabOption<UsageKind>[] = [
  { value: 'page', label: 'Pages' },
  { value: 'api', label: 'API endpoints' },
];

const UsagePagesSection: React.FC<UsagePagesSectionProps> = ({
  kind,
  onKindChange,
  data,
  isLoading,
  error,
  onRetry,
}) => {
  const items = useMemo(
    () => (data?.items ?? []).map(item => ({ ...item, id: item.key })),
    [data]
  );

  const columns = useMemo(
    () => [
      {
        key: 'key',
        label: kind === 'api' ? 'Endpoint' : 'Page',
        sortable: false,
        cellClassName: 'font-mono text-xs align-top',
        render: (_value: unknown, item: UsagePagesItem) => (
          <span className="block max-w-[260px] truncate" title={item.key}>
            {item.key}
          </span>
        ),
      },
      {
        key: 'count',
        label: 'Count',
        sortable: false,
        cellClassName: 'tabular-nums align-top',
        render: (_value: unknown, item: UsagePagesItem) =>
          formatNumber(item.count),
      },
      {
        key: 'unique_users',
        label: 'Unique users',
        sortable: false,
        cellClassName: 'tabular-nums align-top',
        render: (_value: unknown, item: UsagePagesItem) =>
          formatNumber(item.unique_users),
      },
      {
        key: 'adoption_pct',
        label: 'Adoption',
        sortable: false,
        cellClassName: 'tabular-nums align-top',
        render: (_value: unknown, item: UsagePagesItem) =>
          formatPercent(item.adoption_pct),
      },
      {
        key: 'share_pct',
        label: 'Share',
        sortable: false,
        cellClassName: 'tabular-nums align-top',
        render: (_value: unknown, item: UsagePagesItem) =>
          formatPercent(item.share_pct),
      },
      ...(kind === 'page'
        ? [
            {
              key: 'avg_duration_sec',
              label: 'Avg duration',
              sortable: false as const,
              cellClassName: 'tabular-nums align-top',
              render: (_value: unknown, item: UsagePagesItem) =>
                item.avg_duration_sec !== undefined &&
                item.avg_duration_sec !== null
                  ? formatDurationSec(item.avg_duration_sec)
                  : DASH,
            },
          ]
        : []),
    ],
    [kind]
  );

  if (isLoading && !data) {
    return (
      <LoadingState text="Loading top pages..." className="min-h-[160px]" />
    );
  }

  if (error && !data) {
    return (
      <UsageSectionError
        title="Failed to load top pages"
        message={error.message || 'An unexpected error occurred.'}
        onRetry={onRetry}
      />
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Top {kind === 'api' ? 'API endpoints' : 'pages'}
        </h3>
        <SegmentedTabs<UsageKind>
          options={kindOptions}
          value={kind}
          onChange={onKindChange}
          ariaLabel="Choose pages or API endpoints"
        />
      </div>

      {data && items.length === 0 ? (
        <EmptyState
          title="No data for this period"
          description={`No ${kind} activity recorded yet.`}
          compact
        />
      ) : (
        <ServerSideTable
          data={items}
          columns={columns}
          className="max-h-[480px] overflow-y-auto"
        />
      )}

      <p className="text-xs text-muted-foreground">
        Top {USAGE_PAGES_LIMIT} by count · activity grouped by UTC day
        {data?.scope ? ` · scope: ${data.scope}` : ''}
      </p>
    </Card>
  );
};

export default UsagePagesSection;
