'use client';

import React, { useMemo, useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { AqChevronUp, AqChevronDown, AqArrowUp, AqArrowDown, AqRefreshCcw01 } from '@airqo/icons-react';
import { HiMinus } from 'react-icons/hi';
import {
  useComparisonReadings,
  extractReadingNames,
} from '../../hooks/useComparisonReadings';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { AqiLegend } from './AqiLegend';
import {
  getAirQualityColor,
  getAirQualityIcon,
  getAirQualityLabel,
  getAirQualityLevel,
  mapAqiCategoryToLevel,
} from '@/shared/utils/airQuality';
import { cn } from '@/shared/lib/utils';
import type { AqiConfig } from '@/shared/types/aqi';
import type { RecentReading } from '@/shared/types/api';

interface ComparisonTableProps {
  siteIds: string[];
  siteNames: Map<string, string>;
  aqiConfig?: AqiConfig | null;
  /** Hydrates the page-level names map from readings (no raw ids shown) */
  onNamesResolved?: (names: Map<string, string>) => void;
  className?: string;
}

type SortKey = 'pm2_5' | 'pm10' | 'name' | 'time';
type SortDirection = 'asc' | 'desc';

interface ComparisonRow {
  siteId: string;
  name: string;
  city: string;
  country: string;
  pm2_5: number | null;
  pm10: number | null;
  category: string | null;
  percentageDifference: number | null;
  time: string | null;
}

const formatValue = (value: number | null): string => {
  if (value === null || typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }
  return value.toFixed(1);
};

const formatRelativeTime = (value: string | null): string => {
  if (!value) return '—';
  try {
    const parsed = parseISO(value);
    if (Number.isNaN(parsed.getTime())) return '—';
    return formatDistanceToNow(parsed, { addSuffix: true });
  } catch {
    return '—';
  }
};

/**
 * Comparison of the latest readings across every selected location —
 * deliberately unlimited, AirGradient-style. Columns are sortable; PM2.5 and
 * PM10 values are threshold-colored from the live AQI config, missing values
 * render as a dash, and each row carries the site's trend vs the previous
 * reading.
 */
export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  siteIds,
  siteNames,
  aqiConfig,
  onNamesResolved,
  className,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('pm2_5');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: readings, isLoading, error, refetch } = useComparisonReadings(
    siteIds,
    true
  );

  // Reset to the first page when the selection changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [siteIds]);

  const rows = useMemo<ComparisonRow[]>(() => {
    const readingsBySite = new Map<string, RecentReading>();
    (readings ?? []).forEach(reading => {
      const existing = readingsBySite.get(reading.site_id);
      if (
        !existing ||
        new Date(reading.time).getTime() > new Date(existing.time).getTime()
      ) {
        readingsBySite.set(reading.site_id, reading);
      }
    });

    return siteIds.map(siteId => {
      const reading = readingsBySite.get(siteId);
      const pm25 = reading?.pm2_5?.value ?? null;
      const pm10 = reading?.pm10?.value ?? null;
      const percentageDifference =
        typeof reading?.averages?.percentageDifference === 'number'
          ? reading.averages.percentageDifference
          : null;

      return {
        siteId,
        name:
          siteNames.get(siteId) ??
          reading?.siteDetails?.search_name ??
          'Unknown location',
        city: reading?.siteDetails?.city ?? '',
        country: reading?.siteDetails?.country ?? '',
        pm2_5: typeof pm25 === 'number' ? pm25 : null,
        pm10: typeof pm10 === 'number' ? pm10 : null,
        category: reading?.aqi_category ?? null,
        percentageDifference,
        time: reading?.time ?? null,
      };
    });
  }, [readings, siteIds, siteNames]);

  // Share the display names resolved from readings with the parent so the
  // forecast selector and chips never fall back to raw ids.
  React.useEffect(() => {
    if (!onNamesResolved || !readings) return;
    const names = extractReadingNames(readings);
    if (names.size > 0) onNamesResolved(names);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readings]);

  const sortedRows = useMemo(() => {
    const sorted = [...rows];
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;

    sorted.sort((left, right) => {
      if (sortKey === 'name') {
        return (
          left.name.localeCompare(right.name) * directionMultiplier
        );
      }
      if (sortKey === 'time') {
        const leftTime = left.time ? new Date(left.time).getTime() : -1;
        const rightTime = right.time ? new Date(right.time).getTime() : -1;
        return (leftTime - rightTime) * directionMultiplier;
      }
      const leftValue = left[sortKey] ?? -1;
      const rightValue = right[sortKey] ?? -1;
      return (leftValue - rightValue) * directionMultiplier;
    });

    return sorted;
  }, [rows, sortKey, sortDirection]);

  // Client-side pagination (handles the last partial page + bounds correctly)
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedRows.slice(start, start + PAGE_SIZE);
  }, [sortedRows, safePage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection(key === 'name' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  const SortHeader: React.FC<{ label: string; sortableKey: SortKey; className?: string }> = ({
    label,
    sortableKey,
    className,
  }) => (
    <button
      type="button"
      onClick={() => handleSort(sortableKey)}
      aria-label={`Sort by ${label}`}
      className={cn(
        'inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors',
        className
      )}
    >
      {label}
      {sortKey === sortableKey ? (
        sortDirection === 'asc' ? (
          <AqChevronUp className="h-3.5 w-3.5" />
        ) : (
          <AqChevronDown className="h-3.5 w-3.5" />
        )
      ) : (
        <span className="text-gray-300 dark:text-gray-600">
          <AqChevronUp className="h-3 w-3" />
        </span>
      )}
    </button>
  );

  // Each pollutant column must be colored against ITS OWN AQI ranges —
  // pm2_5 and pm10 breakpoints differ (the legend uses the page-selected
  // pollutant, which only matches the pm2_5 column).
  const { config: pm25AqiConfig } = useAqiConfig('pm2_5');
  const { config: pm10AqiConfig } = useAqiConfig('pm10');

  const renderValue = (
    value: number | null,
    pollutant: 'pm2_5' | 'pm10'
  ) => {
    if (value === null) {
      return (
        <span className="text-gray-300 dark:text-gray-600" title="No data">
          —
        </span>
      );
    }
    const columnConfig = pollutant === 'pm10' ? pm10AqiConfig : pm25AqiConfig;
    const level = getAirQualityLevel(value, pollutant, columnConfig ?? null);
    const color = getAirQualityColor(level, columnConfig ?? null);
    return (
      <span className="inline-flex items-center gap-1.5 tabular-nums">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color || '#6B7280' }}
          aria-hidden
        />
        <span className="font-semibold text-foreground">{formatValue(value)}</span>
        <span className="text-xs text-muted-foreground">µg/m³</span>
      </span>
    );
  };

  const renderTrend = (percentageDifference: number | null) => {
    if (percentageDifference === null) {
      return <span className="text-gray-300 dark:text-gray-600">—</span>;
    }
    if (percentageDifference > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
          <AqArrowUp className="h-3.5 w-3.5" />
          {percentageDifference.toFixed(0)}%
        </span>
      );
    }
    if (percentageDifference < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-500">
          <AqArrowDown className="h-3.5 w-3.5" />
          {Math.abs(percentageDifference).toFixed(0)}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
        <HiMinus className="h-3.5 w-3.5" />
        Stable
      </span>
    );
  };

  const renderCategory = (category: string | null, pm25: number | null) => {
    // The badge reflects the PM2.5 reading (its own config) when available,
    // falling back to the API-provided category string.
    const level = mapAqiCategoryToLevel(category ?? undefined);
    const levelFromValue =
      pm25 !== null
        ? getAirQualityLevel(pm25, 'pm2_5', pm25AqiConfig ?? null)
        : level;
    const resolvedLevel = levelFromValue !== 'no-value' ? levelFromValue : level;
    const label = getAirQualityLabel(resolvedLevel, 'WHO', 'PM2.5', pm25AqiConfig ?? null);
    const color = getAirQualityColor(resolvedLevel, pm25AqiConfig ?? null);
    const Icon = getAirQualityIcon(resolvedLevel);

    if (resolvedLevel === 'no-value') {
      return <span className="text-gray-300 dark:text-gray-600">—</span>;
    }

    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
        style={{ backgroundColor: color || '#6B7280' }}
      >
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  };

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Location comparison
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Latest readings across all {siteIds.length} selected location
              {siteIds.length === 1 ? '' : 's'} — no limit applied.
            </p>
          </div>
          <Button
            variant="outlined"
            size="sm"
            Icon={AqRefreshCcw01}
            onClick={() => void refetch()}
            loading={isLoading}
            disabled={isLoading}
            aria-label="Refresh comparison"
          >
            Refresh
          </Button>
        </div>

        <div className="px-4 pt-3">
          <AqiLegend aqiConfig={aqiConfig} />
        </div>

        {siteIds.length === 0 ? (
          <div className="p-4">
            <EmptyState
              compact
              title="No locations to compare"
              description="Add locations to your charts to see their latest readings side by side."
            />
          </div>
        ) : error && !isLoading ? (
          <div className="p-4">
            <ErrorState
              compact
              title="Unable to load readings"
              description={error.message}
              retryAction={{ label: 'Retry', onClick: () => void refetch() }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-2.5">
                    <SortHeader label="Location" sortableKey="name" />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    <SortHeader label="PM2.5" sortableKey="pm2_5" />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    <SortHeader label="PM10" sortableKey="pm10" />
                  </th>
                  <th className="px-3 py-2.5 text-right">AQI level</th>
                  <th className="px-3 py-2.5 text-right">Trend</th>
                  <th className="px-3 py-2.5 text-right">
                    <SortHeader label="Last reading" sortableKey="time" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && rows.length === 0 ? (
                  Array.from({ length: 5 }, (_, index) => (
                    <tr key={index} className="border-b border-border/60">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      </td>
                    </tr>
                  ))
                ) : sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No readings available for the selected locations yet.
                    </td>
                  </tr>
                ) : (
                  pageRows.map(row => (
                    <tr
                      key={row.siteId}
                      className="border-b border-border/60 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <td className="px-4 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {row.name}
                          </p>
                          {(row.city || row.country) && (
                            <p className="truncate text-xs text-muted-foreground">
                              {[row.city, row.country].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {renderValue(row.pm2_5, 'pm2_5')}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {renderValue(row.pm10, 'pm10')}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex justify-end">
                          {renderCategory(row.category, row.pm2_5)}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {renderTrend(row.percentageDifference)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">
                        {formatRelativeTime(row.time)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer — clamped at the bounds, correct on the last page */}
        {!isLoading && sortedRows.length > PAGE_SIZE && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-border bg-muted/30">
            <div className="text-xs text-muted-foreground">
              Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, sortedRows.length)}–{Math.min(safePage * PAGE_SIZE, sortedRows.length)} of {sortedRows.length} locations
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(safePage - 1)}
                disabled={safePage <= 1}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(safePage + 1)}
                disabled={safePage >= totalPages}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComparisonTable;
