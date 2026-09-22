'use client';

import React from 'react';
import { Card } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui';
import { EmptyState } from '@/shared/components/ui';
import { SegmentedTabs } from '@/shared/components/ui';
import {
  DASH,
  formatNumber,
  formatPercent,
  formatDurationSec,
} from '@/modules/usage/utils/format';
import UsageSectionError from '@/modules/usage/components/platform/UsageSectionError';
import type { UsageBreakdownResponse, UsageKind } from '@/shared/types/usage';

export interface UserUsageBreakdownProps {
  data: UsageBreakdownResponse | null;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  kind: UsageKind;
  onKindChange: (kind: UsageKind) => void;
}

const KIND_OPTIONS: { value: UsageKind; label: string }[] = [
  { value: 'page', label: 'Pages' },
  { value: 'api', label: 'API' },
];

/**
 * Per-user breakdown of pages or API endpoints. The `(other)` bucket is the
 * backend's rollup of long-tail items and is rendered verbatim. Page rows carry
 * total/avg duration; API rows carry count + share only.
 */
const UserUsageBreakdown: React.FC<UserUsageBreakdownProps> = ({
  data,
  isLoading,
  error,
  onRetry,
  kind,
  onKindChange,
}) => {
  if (isLoading && !data) {
    return (
      <Card className="p-4">
        <LoadingState text="Loading breakdown..." className="min-h-[160px]" />
      </Card>
    );
  }

  if (error && !data) {
    return (
      <UsageSectionError
        title="Failed to load breakdown"
        message={error.message || 'An unexpected error occurred.'}
        onRetry={onRetry}
      />
    );
  }

  if (!data) {
    return (
      <Card className="p-4">
        <EmptyState
          title="No breakdown data"
          description="Nothing recorded for this period yet."
          compact
        />
      </Card>
    );
  }

  const items = data.items ?? [];

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {kind === 'page' ? 'Top Pages' : 'Top API Endpoints'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {data.month} · {formatNumber(data.total)} total ·{' '}
            {data.basis ?? DASH}
          </p>
        </div>
        <SegmentedTabs<UsageKind>
          ariaLabel="Breakdown kind"
          size="sm"
          options={KIND_OPTIONS}
          value={kind}
          onChange={onKindChange}
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={kind === 'page' ? 'No page views yet' : 'No API calls yet'}
          description="Items will appear here once activity is recorded for this period."
          compact
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  {kind === 'page' ? 'Page' : 'Endpoint'}
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold text-right">
                  Count
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold text-right">
                  Share
                </th>
                {kind === 'page' && (
                  <>
                    <th
                      scope="col"
                      className="py-2 pr-4 font-semibold text-right"
                    >
                      Total time
                    </th>
                    <th
                      scope="col"
                      className="py-2 pr-4 font-semibold text-right"
                    >
                      Avg time
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map(item => (
                <tr key={item.key} className="hover:bg-muted/30">
                  <td className="py-2 pr-4 font-medium break-all">
                    {item.key}
                  </td>
                  <td className="py-2 pr-4 tabular-nums text-right">
                    {formatNumber(item.count)}
                  </td>
                  <td className="py-2 pr-4 tabular-nums text-right text-muted-foreground">
                    {formatPercent(item.share_pct)}
                  </td>
                  {kind === 'page' && (
                    <>
                      <td className="py-2 pr-4 tabular-nums text-right text-muted-foreground">
                        {formatDurationSec(item.total_duration_sec)}
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-right text-muted-foreground">
                        {formatDurationSec(item.avg_duration_sec)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default UserUsageBreakdown;
