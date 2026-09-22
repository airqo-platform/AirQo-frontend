'use client';

import React, { useMemo } from 'react';
import { Card } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui';
import { EmptyState } from '@/shared/components/ui';
import { SegmentedTabs } from '@/shared/components/ui';
import type { SegmentedTabOption } from '@/shared/components/ui';
import {
  DASH,
  formatNumber,
  formatPercent,
  formatDurationSec,
} from '@/modules/usage/utils/format';
import UsageSectionError from '@/modules/usage/components/platform/UsageSectionError';
import type { UsageKind, UsagePagesResponse } from '@/shared/types/usage';

/** Backend caps top-pages results at 50. */
export const USAGE_PAGES_LIMIT = 50;

/**
 * Pages/endpoints section. `kind` is controlled by the parent so it can live
 * alongside the shared filters. Data comes from `useUsagePages` via props.
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
  const items = useMemo(() => data?.items ?? [], [data]);

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
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  {kind === 'api' ? 'Endpoint' : 'Page'}
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Count
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Unique users
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Adoption
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Share
                </th>
                {kind === 'page' ? (
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Avg duration
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map(item => (
                <tr key={item.key} className="hover:bg-muted/30">
                  <td
                    className="py-2 pr-4 font-mono text-xs align-top max-w-[260px] truncate"
                    title={item.key}
                  >
                    {item.key}
                  </td>
                  <td className="py-2 pr-4 tabular-nums align-top">
                    {formatNumber(item.count)}
                  </td>
                  <td className="py-2 pr-4 tabular-nums align-top">
                    {formatNumber(item.unique_users)}
                  </td>
                  <td className="py-2 pr-4 tabular-nums align-top">
                    {formatPercent(item.adoption_pct)}
                  </td>
                  <td className="py-2 pr-4 tabular-nums align-top">
                    {formatPercent(item.share_pct)}
                  </td>
                  {kind === 'page' ? (
                    <td className="py-2 pr-4 tabular-nums align-top whitespace-nowrap">
                      {item.avg_duration_sec !== undefined &&
                      item.avg_duration_sec !== null
                        ? formatDurationSec(item.avg_duration_sec)
                        : DASH}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Top {USAGE_PAGES_LIMIT} by count · activity grouped by UTC day
        {data?.scope ? ` · scope: ${data.scope}` : ''}
      </p>
    </Card>
  );
};

export default UsagePagesSection;
