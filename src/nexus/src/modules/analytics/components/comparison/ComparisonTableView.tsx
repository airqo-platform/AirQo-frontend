'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  DataTable,
  type DataTableColumn,
} from '@/shared/components/ui/data-table';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { LoadingState } from '@/shared/components/ui/loading-state';
import {
  sortComparisonRows,
  type ComparisonRow,
  type ComparisonSortDir,
  type ComparisonSortKey,
} from '../../utils/comparisonRows';

interface ComparisonTableViewProps {
  /** One row per selected location — including honest no-data rows. */
  rows: ComparisonRow[];
  isLoading: boolean;
  error: string | null;
  /** False when nothing is selected yet (drives the pick-locations empty state). */
  hasSelection: boolean;
  onRetry: () => void;
  className?: string;
}

const COLUMNS: DataTableColumn<ComparisonRow>[] = [
  {
    key: 'name',
    label: 'Site',
    cellClassName: 'font-medium text-foreground',
    render: row => (
      <span className="block max-w-[220px] truncate">{row.siteName}</span>
    ),
  },
  {
    key: 'aqi',
    label: 'AQI',
    render: row =>
      row.hasReading ? (
        <span className="flex items-center gap-2">
          <span
            className="inline-flex min-w-[2.75rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: row.aqiColor ?? undefined }}
          >
            {row.aqiIndex ?? '—'}
          </span>
          {row.aqiCategory && (
            <span className="text-xs text-muted-foreground">
              {row.aqiCategory}
            </span>
          )}
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          No reading
        </span>
      ),
  },
  {
    key: 'pm2_5',
    label: 'PM2.5',
    unit: 'µg/m³',
    cellClassName: 'tabular-nums text-foreground',
    render: row => formatPollutantCell(row.pm2_5),
  },
  {
    key: 'pm10',
    label: 'PM10',
    unit: 'µg/m³',
    cellClassName: 'tabular-nums text-foreground',
    render: row => formatPollutantCell(row.pm10),
  },
  {
    key: 'no2',
    label: 'NO2',
    unit: 'µg/m³',
    headerClassName: 'hidden sm:table-cell',
    cellClassName: 'hidden sm:table-cell tabular-nums text-foreground',
    render: row => formatPollutantCell(row.no2),
  },
  {
    key: 'time',
    label: 'Last reading',
    cellClassName: 'text-muted-foreground',
    render: row => row.lastReadingLabel,
  },
  {
    key: 'freshness',
    label: 'Freshness',
    sortable: false,
    render: row => (
      <span
        className={cn(
          'text-xs font-medium',
          row.hasReading ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {row.freshnessLabel}
      </span>
    ),
  },
];

const DEFAULT_DIR_BY_KEY: Record<
  Exclude<ComparisonSortKey, 'time'>,
  ComparisonSortDir
> & { time: ComparisonSortDir } = {
  name: 'asc',
  aqi: 'desc',
  pm2_5: 'desc',
  pm10: 'desc',
  no2: 'desc',
  time: 'desc',
};

const formatPollutantCell = (value: number | null): string =>
  value === null ? '—' : value.toFixed(1);

/**
 * The "Compare locations" table: Site | AQI badge | PM2.5 | PM10 | NO2 |
 * Last reading | Freshness. Worst-AQI-first by default ("league table"),
 * click-to-sort headers (local state only), sticky header inside an
 * overflow-x-auto wrapper, NO2 hidden below `sm`. Locations without a
 * recent reading render an honest muted "No reading" row — never omitted.
 */
export const ComparisonTableView: React.FC<ComparisonTableViewProps> = ({
  rows,
  isLoading,
  error,
  hasSelection,
  onRetry,
  className,
}) => {
  const [sortKey, setSortKey] = useState<ComparisonSortKey>('aqi');
  const [sortDir, setSortDir] = useState<ComparisonSortDir>('desc');

  const sortedRows = useMemo(
    () => sortComparisonRows(rows, sortKey, sortDir),
    [rows, sortKey, sortDir]
  );

  const handleSortClick = (key: string) => {
    if (key === sortKey) {
      setSortDir(currentDir => (currentDir === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key as ComparisonSortKey);
    setSortDir(DEFAULT_DIR_BY_KEY[key as ComparisonSortKey]);
  };

  // Rows exist for every selected location (including honest no-data rows),
  // so "no data at all" means no row carries a reading.
  const hasAnyReading = sortedRows.some(row => row.hasReading);

  if (error && !hasAnyReading) {
    return (
      <ErrorState
        title="Unable to load the latest readings"
        description={error}
        retryAction={{ label: 'Retry', onClick: onRetry }}
        className={className}
      />
    );
  }

  if (!hasSelection) {
    return (
      <EmptyState
        title="Pick locations to compare"
        description="Select one or more locations above to see their latest air-quality readings side by side."
        className={className}
      />
    );
  }

  if (sortedRows.length === 0 && !isLoading) {
    return (
      <EmptyState
        title="No recent readings"
        description="None of the selected locations returned a recent reading. Try different locations or check back later."
        className={className}
      />
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <DataTable
          data={sortedRows}
          columns={COLUMNS}
          rowKey={row => row.siteId}
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={handleSortClick}
          loading={isLoading}
          loadingComponent={
            <LoadingState
              text="Loading latest readings..."
              className="min-h-[200px]"
            />
          }
          className="rounded-b-lg"
        />
      </CardContent>
    </Card>
  );
};
