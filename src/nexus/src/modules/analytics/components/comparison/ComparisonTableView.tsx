'use client';

import React, { useMemo, useState } from 'react';
import { HiChevronRight } from 'react-icons/hi';
import { HiInformationCircle } from 'react-icons/hi2';
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
  getAirQualityLevel,
  getAirQualityColor,
} from '@/shared/utils/airQuality';
import type { AqiConfig } from '@/shared/types/aqi';
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
  /** Live PM2.5 AQI ranges config — drives the color strip on PM2.5 values. */
  pm25Config?: AqiConfig | null;
  /** Live PM10 AQI ranges config — drives the color strip on PM10 values. */
  pm10Config?: AqiConfig | null;
  /** Opens the reusable site-details dialog for this row. */
  onSiteClick?: (row: ComparisonRow) => void;
}

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
 * Renders a pollutant value with a small color strip whose color is derived
 * from the live AQI ranges for that pollutant.
 */
const PollutantCell: React.FC<{
  value: number | null;
  pollutant: 'pm2_5' | 'pm10';
  config: AqiConfig | null;
}> = ({ value, pollutant, config }) => {
  if (value === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  const level = getAirQualityLevel(value, pollutant, config);
  const color = getAirQualityColor(level, config);
  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums text-foreground">
      <span
        className="inline-block h-1.5 w-6 rounded-full"
        style={{ backgroundColor: color || '#6B7280' }}
        aria-hidden="true"
      />
      {value.toFixed(1)}
    </span>
  );
};

/**
 * The "Compare locations" table: Site | AQI value | PM2.5 | PM10 | NO2 |
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
  pm25Config = null,
  pm10Config = null,
  onSiteClick,
}) => {
  const [sortKey, setSortKey] = useState<ComparisonSortKey>('aqi');
  const [sortDir, setSortDir] = useState<ComparisonSortDir>('desc');

  const columns = useMemo<DataTableColumn<ComparisonRow>[]>(
    () => [
      {
        key: 'name',
        label: 'Site',
        cellClassName: 'font-medium text-foreground',
        render: row =>
          onSiteClick ? (
            <button
              type="button"
              onClick={() => onSiteClick(row)}
              className="group flex max-w-[240px] items-center gap-1 text-left font-medium text-foreground transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              title={`View details for ${row.siteName}`}
              aria-label={`View details for ${row.siteName}`}
            >
              <span className="truncate">{row.siteName}</span>
              <HiChevronRight
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                aria-hidden="true"
              />
            </button>
          ) : (
            <span className="block max-w-[220px] truncate">{row.siteName}</span>
          ),
      },
      {
        key: 'aqi',
        label: 'AQI',
        render: row =>
          row.hasReading ? (
            <span className="inline-flex min-w-[2.75rem] text-xs font-semibold tabular-nums text-foreground">
              {row.aqiIndex ?? '—'}
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
        render: row => (
          <PollutantCell
            value={row.pm2_5}
            pollutant="pm2_5"
            config={pm25Config}
          />
        ),
      },
      {
        key: 'pm10',
        label: 'PM10',
        unit: 'µg/m³',
        cellClassName: 'tabular-nums text-foreground',
        render: row => (
          <PollutantCell
            value={row.pm10}
            pollutant="pm10"
            config={pm10Config}
          />
        ),
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
    ],
    [pm25Config, pm10Config, onSiteClick]
  );

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
        {onSiteClick && (
          <p className="flex items-center gap-1.5 border-b border-border/50 px-4 pb-2.5 pt-3 text-xs text-muted-foreground">
            <HiInformationCircle
              className="h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            />
            Click a site to view its details
          </p>
        )}
        <DataTable
          data={sortedRows}
          columns={columns}
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
