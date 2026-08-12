'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { AqiConfig } from '@/shared/types/aqi';
import type { RankingHistoryEntry } from '@/shared/types/api';
import {
  getAirQualityColor,
  mapAqiCategoryToLevel,
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
 * Year-by-year historical comparison with entities as rows and years as
 * columns. A year with no usable data comes back as `null` from the API and
 * is rendered as a grayed-out dash — never as "clean air".
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

  const sortedHistory = useMemo(
    () => sortHistoryEntriesByLatestValue(history),
    [history]
  );

  const categoryColor = (category: string | null | undefined): string => {
    if (!category) return '#6B7280';
    const level = mapAqiCategoryToLevel(category);
    return getAirQualityColor(level, aqiConfig ?? null);
  };

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            Year-by-year comparison
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Average PM2.5 (µg/m³) per year. Years without data are shown as a
            dash — they are not treated as clean air.
          </p>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2 animate-pulse">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-9 rounded bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Try again
              </button>
            )}
          </div>
        ) : sortedHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <p className="text-sm text-muted-foreground">
              No historical data available for the selected range. Historical
              depth builds up gradually as the background process accumulates
              records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">
                    Location
                  </th>
                  {years.map(year => (
                    <th
                      key={year}
                      className="px-3 py-2.5 text-right font-medium text-muted-foreground"
                    >
                      {year}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                    Sites
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedHistory.map(entry => {
                  const latestYear = [...entry.values]
                    .reverse()
                    .find(value => typeof value.avg_pm2_5 === 'number');
                  return (
                    <tr
                      key={`${entry.level}-${entry.name}`}
                      className="border-b border-border/60 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          {entry.country_code ? (
                            <Image
                              src={`https://flagcdn.com/w40/${entry.country_code.toLowerCase()}.png`}
                              alt=""
                              width={20}
                              height={14}
                              className="h-3.5 w-5 rounded-[2px] object-cover flex-shrink-0"
                              unoptimized
                            />
                          ) : (
                            <span className="h-3.5 w-5 flex-shrink-0 rounded-[2px] bg-gray-200 dark:bg-gray-700" />
                          )}
                          <span className="truncate font-medium text-foreground">
                            {entry.name}
                          </span>
                        </div>
                      </td>
                      {years.map(year => {
                        const value = entry.values.find(
                          item => item.year === year
                        );
                        const hasValue =
                          value && typeof value.avg_pm2_5 === 'number';
                        return (
                          <td
                            key={year}
                            className={cn(
                              'px-3 py-2.5 text-right tabular-nums',
                              hasValue
                                ? 'font-semibold text-foreground'
                                : 'text-gray-300 dark:text-gray-600'
                            )}
                          >
                            {hasValue ? (
                              <span className="inline-flex items-center gap-1.5">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{
                                    backgroundColor: categoryColor(
                                      value.aqi_category
                                    ),
                                  }}
                                  aria-hidden
                                />
                                {formatValue(value.avg_pm2_5)}
                              </span>
                            ) : (
                              <span title="No data for this year">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-right">
                        {latestYear ? (
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {latestYear.site_count}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300 dark:text-gray-600">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RankingsHistoryTable;

