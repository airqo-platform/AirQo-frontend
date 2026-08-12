'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { EmptyState } from '@/shared/components/ui/empty-state';
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

/**
 * IQAir-style ranked leaderboard built on the shared ServerSideTable so it
 * matches every other table in the app (search, pagination, states). Rows
 * keep the server-assigned order — the rank column is intentionally not
 * sortable, and columns sort only when the server data is authoritative.
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

  const rows = useMemo(
    () =>
      rankings.map(entry => ({
        ...entry,
        // MultiSelectTable keys rows by `id`; rank is unique per dataset.
        id: entry.rank,
      })),
    [rankings]
  );

  const columns = useMemo(() => {
    const rightAlign = {
      headerClassName: 'text-right',
      cellClassName: 'whitespace-nowrap text-right',
    };

    return [
      {
        key: 'rank',
        label: 'Rank',
        sortable: false,
        width: '3.5rem',
        minWidth: '3.5rem',
        render: (_value: unknown, item: (typeof rows)[number]) => {
          const isTopThree = item.rank >= 1 && item.rank <= 3;
          const medal = MEDAL_EMOJI[item.rank];
          return isTopThree ? (
            <span
              className="text-xl"
              role="img"
              aria-label={`Rank ${item.rank}`}
            >
              {medal}
            </span>
          ) : (
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              {item.rank}
            </span>
          );
        },
      },
      {
        key: 'name',
        label: 'Location',
        sortable: false,
        render: (_value: unknown, item: (typeof rows)[number]) => (
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
      {
        key: 'avg_pm2_5',
        label: 'PM2.5',
        sortable: false,
        ...rightAlign,
        render: (value: unknown) => (
          <>
            <span className="font-semibold tabular-nums text-foreground">
              {formatValue(typeof value === 'number' ? value : null)}
            </span>
            <span className="ml-0.5 text-xs text-muted-foreground">µg/m³</span>
          </>
        ),
      },
      {
        key: 'aqi_index',
        label: 'AQI',
        sortable: false,
        ...rightAlign,
        render: (value: unknown) => (
          <span className="tabular-nums text-muted-foreground">
            {typeof value === 'number' && Number.isFinite(value) ? value : '—'}
          </span>
        ),
      },
      {
        key: 'aqi_category',
        label: 'Category',
        sortable: false,
        headerClassName: 'text-right',
        cellClassName: 'whitespace-nowrap text-right',
        render: (_value: unknown, item: (typeof rows)[number]) => (
          <div className="flex justify-end">
            <AqiCategoryBadge
              category={item.aqi_category}
              aqiConfig={aqiConfig}
              compact
            />
          </div>
        ),
      },
      {
        key: 'site_count',
        label: 'Sites',
        sortable: false,
        ...rightAlign,
        render: (value: unknown) => (
          <span className="tabular-nums text-muted-foreground">
            {typeof value === 'number' ? value : '—'}
          </span>
        ),
      },
    ];
  }, [aqiConfig]);

  return (
    <ServerSideTable
      title="Live rankings"
      data={rows}
      columns={columns}
      loading={isLoading}
      error={error}
      onRefresh={onRetry}
      searchableColumns={['name']}
      showClientPagination
      className={className}
      customHeader={
        generatedAt ? (
          <span className="text-xs text-muted-foreground">
            Updated {formatRankingsGeneratedAt(generatedAt)}
          </span>
        ) : undefined
      }
      emptyComponent={
        <EmptyState
          title="No rankings available"
          description="Locations only appear once they have a reading from the last 3 days."
          className="min-h-[300px] border-0 bg-transparent"
        />
      }
    />
  );
};

export default RankingsLeaderboard;
