'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/components/ui/card';
import { AnalyticsCard } from '../AnalyticsCard';
import type { AqiConfig } from '@/shared/types/aqi';
import type { RankingEntry } from '@/shared/types/api';
import { mapAqiCategoryToLevel } from '@/shared/utils/airQuality';
import type { SiteData } from '../../types';

interface RankingsSummaryCardsProps {
  rankings: RankingEntry[];
  aqiConfig?: AqiConfig | null;
  isLoading?: boolean;
  className?: string;
}

/**
 * Map a ranking entry into the SiteData shape the shared AnalyticsCard
 * consumes, so the leaderboard highlights reuse the exact favorites card.
 */
const buildHighlightSiteData = (entry: RankingEntry): SiteData => ({
  _id: `ranking-${entry.level}-${entry.name}`,
  name: entry.name,
  search_name: entry.name,
  location: `${entry.site_count} monitoring site${entry.site_count === 1 ? '' : 's'}`,
  country: entry.country_code ?? undefined,
  value: entry.avg_pm2_5 ?? 0,
  status: mapAqiCategoryToLevel(entry.aqi_category ?? undefined),
  aqi_category: entry.aqi_category ?? undefined,
  pollutant: 'pm2_5',
  unit: 'μg/m³',
  trend: 'stable',
});

/**
 * Highlight cards above the leaderboard — most polluted and cleanest air
 * reuse the favorites AnalyticsCard for consistency, plus a count card.
 */
export const RankingsSummaryCards: React.FC<RankingsSummaryCardsProps> = ({
  rankings,
  aqiConfig,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4', className)}>
        {[0, 1, 2].map(index => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4 space-y-3">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const entriesWithValue = (rankings ?? []).filter(
    entry => typeof entry.avg_pm2_5 === 'number'
  );

  if (entriesWithValue.length === 0) {
    return null;
  }

  const worst = entriesWithValue.reduce((max, entry) =>
    (entry.avg_pm2_5 as number) > (max.avg_pm2_5 as number) ? entry : max
  );
  const best = entriesWithValue.reduce((min, entry) =>
    (entry.avg_pm2_5 as number) < (min.avg_pm2_5 as number) ? entry : min
  );

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      <AnalyticsCard
        siteData={{
          ...buildHighlightSiteData(worst),
          name: 'Most polluted',
          search_name: 'Most polluted',
        }}
        aqiConfig={aqiConfig ?? null}
        selectedPollutant="pm2_5"
        showIcon
        showTrend={false}
        interactive={false}
      />
      <AnalyticsCard
        siteData={{
          ...buildHighlightSiteData(best),
          name: 'Cleanest air',
          search_name: 'Cleanest air',
        }}
        aqiConfig={aqiConfig ?? null}
        selectedPollutant="pm2_5"
        showIcon
        showTrend={false}
        interactive={false}
      />

      {/* Locations ranked — count card in the same visual language */}
      <Card>
        <CardContent className="p-4 flex flex-col justify-between space-y-4 h-full">
          <div className="flex-1 min-w-0 pr-4">
            <h5 className="text-md truncate max-w-[140px] mb-1">
              Locations ranked
            </h5>
            <p className="text-sm text-gray-500 truncate max-w-[180px]">
              entries with recent readings
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl" role="img" aria-label="Ranked locations">
                  📊
                </span>
                <div className="text-xs text-gray-600">Last 3 days</div>
              </div>
              <div className="text-3xl font-bold">{rankings.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingsSummaryCards;
