'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { EmptyState } from '@/shared/components/ui/empty-state';
import type { AqiConfig } from '@/shared/types/aqi';
import type { RankingHistoryEntry } from '@/shared/types/api';
import {
  getAirQualityColor,
  getAirQualityLevel,
} from '@/shared/utils/airQuality';
import { sortHistoryEntriesByLatestValue } from '../../utils/rankings';

interface RankingsHistoryTableProps {
  history: RankingHistoryEntry[];
  aqiConfig?: AqiConfig | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

const formatValue = (value: number | null): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }
  return value >= 100 ? String(Math.round(value)) : value.toFixed(1);
};

/**
 * Flattened history row: one top-level numeric key per year (so the shared
 * table's sorting compares numbers, not objects) plus the latest year's
 * site count and the display fields.
 */
interface HistoryRow {
  id: string;
  name: string;
  level: string;
  country_code: string | null;
  site_count: number | null;
  [year: string]: unknown;
}

/**
 * Year-by-year historical comparison with entities as rows and years as
 * columns, built on the shared ServerSideTable so it matches every other
 * table in the app. A year with no usable data comes back as `null` from
 * the API and is rendered as a grayed-out dash — never as "clean air".
 */
export const RankingsHistoryTable: React.FC<RankingsHistoryTableProps> = ({
  history,
  aqiConfig,
  isLoading = false,
  error = null,
  onRetry,
  className,
}) => {
  const years = useMemo(() => {
    const yearSet = new Set<number>();
    history.forEach(entry =>
      entry.values.forEach(value => yearSet.add(value.year))
    );
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [history]);

  const rows = useMemo<HistoryRow[]>(() => {
    return sortHistoryEntriesByLatestValue(history).map(entry => {
      const latestYear = [...entry.values]
        .reverse()
        .find(value => typeof value.avg_pm2_5 === 'number');
      const row: HistoryRow = {
        id: entry.name,
        name: entry.name,
        level: entry.level,
        country_code: entry.country_code,
        site_count: latestYear?.site_count ?? null,
      };
      entry.values.forEach(value => {
        row[String(value.year)] = value.avg_pm2_5;
      });
      return row;
    });
  }, [history]);

  const columns = useMemo(() => {
    const rightAlign = {
      headerClassName: 'text-right',
      cellClassName: 'whitespace-nowrap text-right',
    };

    return [
      {
        key: 'name',
        label: 'Location',
        sortable: true,
        render: (_value: unknown, item: HistoryRow) => (
          <div className="flex items-center gap-2.5">
            {item.country_code ? (
              <Image
                src={`https://flagcdn.com/w40/${item.country_code.toLowerCase()}.png`}
                alt=""
                width={20}
                height={14}
                className="h-3.5 w-5 flex-shrink-0 rounded-[2px] object-cover"
                unoptimized
              />
            ) : (
              <span className="h-3.5 w-5 flex-shrink-0 rounded-[2px] bg-gray-200 dark:bg-gray-700" />
            )}
            <span className="truncate font-medium text-foreground">
              {item.name}
            </span>
          </div>
        ),
      },
      ...years.map(year => ({
        key: String(year),
        label: String(year),
        sortable: true,
        ...rightAlign,
        render: (value: unknown) => {
          const pm = typeof value === 'number' ? value : null;
          if (pm === null) {
            return (
              <span
                className="text-gray-300 dark:text-gray-600"
                title="No data for this year"
              >
                —
              </span>
            );
          }
          const level = getAirQualityLevel(pm, 'pm2_5', aqiConfig ?? null);
          const color = getAirQualityColor(level, aqiConfig ?? null);
          return (
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color || '#6B7280' }}
                aria-hidden
              />
              {formatValue(pm)}
            </span>
          );
        },
      })),
      {
        key: 'site_count',
        label: 'Sites',
        sortable: true,
        ...rightAlign,
        render: (value: unknown) => (
          <span className="text-xs tabular-nums text-muted-foreground">
            {typeof value === 'number' ? value : '—'}
          </span>
        ),
      },
    ];
  }, [years, aqiConfig]);

  return (
    <ServerSideTable
      title="Year-by-year comparison"
      data={rows}
      columns={columns}
      loading={isLoading}
      error={error}
      onRefresh={onRetry}
      searchableColumns={['name']}
      showClientPagination
      className={className}
      customHeader={
        <span className="w-full text-left text-xs text-muted-foreground">
          Average PM2.5 (µg/m³) per year. Years without data are shown as a
          dash — they are not treated as clean air.
        </span>
      }
      emptyComponent={
        <EmptyState
          title="No historical data available"
          description="Historical depth builds up gradually as the background process accumulates records."
          className="min-h-[300px] border-0 bg-transparent"
        />
      }
    />
  );
};

export default RankingsHistoryTable;
