'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { AqiConfig } from '@/shared/types/aqi';
import type { RankingEntry } from '@/shared/types/api';
import { formatRankingsGeneratedAt } from '../../utils/rankings';
import AqiCategoryBadge from './AqiCategoryBadge';

interface RankingsLeaderboardProps {
  rankings: RankingEntry[];
  aqiConfig?: AqiConfig | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

const MEDAL_EMOJI: Record<number, string> = {
  1: '\u{1F947}',
  2: '\u{1F948}',
  3: '\u{1F949}',
};

const formatValue = (value: number | null): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }
  return value >= 100 ? String(Math.round(value)) : value.toFixed(1);
};

const SkeletonRows: React.FC = () => (
  <>
    {Array.from({ length: 8 }, (_, index) => (
      <tr key={index} className="animate-pulse">
        <td className="px-4 py-3">
          <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-700" />
        </td>
        <td className="px-3 py-3">
          <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-700" />
        </td>
        <td className="px-3 py-3">
          <div className="ml-auto h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </td>
        <td className="px-3 py-3">
          <div className="ml-auto h-4 w-10 rounded bg-gray-200 dark:bg-gray-700" />
        </td>
        <td className="px-3 py-3">
          <div className="ml-auto h-5 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
        </td>
        <td className="hidden px-3 py-3 lg:table-cell">
          <div className="ml-auto h-4 w-8 rounded bg-gray-200 dark:bg-gray-700" />
        </td>
      </tr>
    ))}
  </>
);

/**
 * IQAir-style ranked leaderboard: a real semantic table with quiet column
 * headers, a colored AQI pill per row and medal ranks for the top three.
 * Scrolls horizontally on small screens instead of cardifying.
 */
export const RankingsLeaderboard: React.FC<RankingsLeaderboardProps> = ({
  rankings,
  aqiConfig,
  isLoading = false,
  error = null,
  onRetry,
  className,
}) => {
  const generatedAt = rankings[0]?.generated_at;

  // Client-side pagination (handles the last partial page + bounds correctly)
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(rankings.length / PAGE_SIZE));
  const [currentPage, setCurrentPage] = useState(1);
  const safePage = Math.min(currentPage, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rankings.slice(start, start + PAGE_SIZE);
  }, [rankings, safePage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  // Reset to the first page when the dataset changes (level/sort/limit) —
  // keyed on the data content, not the array identity, so background
  // revalidations with identical data don't reset the page.
  const datasetKey = useMemo(
    () => rankings.map(entry => `${entry.rank}:${entry.name}`).join('|'),
    [rankings]
  );
  React.useEffect(() => {
    setCurrentPage(1);
  }, [datasetKey]);

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            Live rankings
          </h2>
          {generatedAt && (
            <span className="text-xs text-muted-foreground">
              Updated {formatRankingsGeneratedAt(generatedAt)}
            </span>
          )}
        </div>

        {error && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
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
        ) : rankings.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-sm text-muted-foreground">
              No rankings are available right now. Locations only appear once
              they have a reading from the last 3 days.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 w-14">Rank</th>
                  <th className="px-3 py-2.5">Location</th>
                  <th className="px-3 py-2.5 text-right">PM2.5</th>
                  <th className="px-3 py-2.5 text-right">AQI</th>
                  <th className="px-3 py-2.5 text-right">Category</th>
                  <th className="hidden px-3 py-2.5 text-right lg:table-cell">
                    Sites
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
          <SkeletonRows />
        ) : (
          pageRows.map(entry => {
            const isTopThree = entry.rank >= 1 && entry.rank <= 3;
            const medal = MEDAL_EMOJI[entry.rank];
            return (
              <tr
                key={`${entry.level}-${entry.name}`}
                className={cn(
                  'border-b border-border/60 last:border-b-0 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60',
                  isTopThree && 'bg-primary/[0.03]'
                )}
              >
                <td className="px-4 py-2.5">
                  {isTopThree ? (
                    <span
                      className="text-xl"
                      role="img"
                      aria-label={`Rank ${entry.rank}`}
                    >
                      {medal}
                    </span>
                  ) : (
                    <span className="text-sm font-medium tabular-nums text-muted-foreground">
                      {entry.rank}
                    </span>
                  )}
                </td>

                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2.5">
                            {entry.country_code ? (
                              <Image
                                src={`https://flagcdn.com/w40/${entry.country_code.toLowerCase()}.png`}
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
                              {entry.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <span className="font-semibold tabular-nums text-foreground">
                            {formatValue(entry.avg_pm2_5)}
                          </span>
                          <span className="ml-0.5 text-xs text-muted-foreground">
                            µg/m³
                          </span>
                        </td>

                        <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                          {entry.aqi_index ?? '—'}
                        </td>

                        <td className="px-3 py-2.5">
                          <div className="flex justify-end">
                            <AqiCategoryBadge
                              category={entry.aqi_category}
                              aqiConfig={aqiConfig}
                              compact
                            />
                          </div>
                        </td>

                        <td className="hidden px-3 py-2.5 text-right tabular-nums text-muted-foreground lg:table-cell">
                          {entry.site_count}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer — clamped at the bounds, correct on the last page */}
        {!isLoading && rankings.length > PAGE_SIZE && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-border bg-muted/30">
            <div className="text-xs text-muted-foreground">
              Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, rankings.length)}–{Math.min(safePage * PAGE_SIZE, rankings.length)} of {rankings.length} locations
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

export default RankingsLeaderboard;
