'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { cn } from '@/shared/lib/utils';
import PageHeading from '@/shared/components/ui/page-heading';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import { AqRefreshCcw01 } from '@airqo/icons-react';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { useRankings } from '../hooks/useRankings';
import { useRankingsHistory } from '../hooks/useRankingsHistory';
import { AqiLegend } from './explorer/AqiLegend';
import {
  RankingsHistoryFilters,
  RankingsSummaryCards,
  RankingsLeaderboard,
  RankingsHistoryTable,
  RankingsHistoryChart,
} from './rankings';
import type { RankingsLevel, RankingsSort } from '@/shared/types/api';

type RankingsTab = 'live' | 'history';

const TAB_OPTIONS: { value: RankingsTab; label: string }[] = [
  { value: 'live', label: 'Live rankings' },
  { value: 'history', label: 'Historical comparison' },
];

const LEVEL_OPTIONS: { value: RankingsLevel; label: string }[] = [
  { value: 'country', label: 'Country' },
  { value: 'city', label: 'City' },
];

const SORT_OPTIONS: { value: RankingsSort; label: string }[] = [
  { value: 'worst', label: 'Worst first' },
  { value: 'best', label: 'Cleanest first' },
];

const LIMIT_OPTIONS = [10, 20, 50, 100];
const DEFAULT_LIMIT = 20;

interface AirQualityRankingsPageProps {
  className?: string;
}

/**
 * Air Quality Rankings — the African AQI leaderboard.
 *
 * The AQI legend is placed at the page level (above the leaderboard) so it
 * stays visible across both the live and historical tabs without repeating.
 */
export const AirQualityRankingsPage: React.FC<
  AirQualityRankingsPageProps
> = ({ className }) => {
  const posthog = usePostHog();
  const { config: aqiConfig, isLoading: aqiConfigLoading } =
    useAqiConfig('pm2_5');

  const [tab, setTab] = useState<RankingsTab>('live');
  const [level, setLevel] = useState<RankingsLevel>('country');
  const [sort, setSort] = useState<RankingsSort>('worst');
  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);

  const [historyLevel, setHistoryLevel] = useState<RankingsLevel>('country');
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState<number>(currentYear - 2);
  const [endYear, setEndYear] = useState<number>(currentYear);

  const {
    rankings,
    isLoading: rankingsLoading,
    isRefreshing,
    error: rankingsError,
    refetch: refetchRankings,
  } = useRankings({ level, sort, limit }, tab === 'live');

  const {
    history,
    isLoading: historyLoading,
    isRefreshing: historyRefreshing,
    error: historyError,
    refetch: refetchHistory,
  } = useRankingsHistory(
    { level: historyLevel, start_year: startYear, end_year: endYear },
    tab === 'history'
  );

  useEffect(() => {
    posthog?.capture('air_quality_rankings_viewed', {
      tab,
      level: tab === 'live' ? level : historyLevel,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleRefresh = useCallback(async () => {
    if (tab === 'live') {
      await refetchRankings();
    } else {
      await refetchHistory();
    }
  }, [tab, refetchHistory, refetchRankings]);

  const isRefreshingAny =
    tab === 'live' ? isRefreshing : historyRefreshing;

  return (
    <div className={cn('space-y-6', className)}>
      <PageHeading
        title="Air Quality Rankings"
        subtitle="Compare average PM2.5 air quality across African countries and cities, ranked by their current AQI."
        infoLine="Only locations with a reading from the last 3 days are ranked. Years without data in the historical view are shown as a dash — not as clean air."
        action={
          <Button
            variant="outlined"
            size="sm"
            onClick={() => void handleRefresh()}
            Icon={AqRefreshCcw01}
            loading={isRefreshingAny}
            disabled={isRefreshingAny}
          >
            Refresh
          </Button>
        }
      />

      {/* Tab switcher — SegmentedTabs component for consistency */}
      <SegmentedTabs
        ariaLabel="Rankings views"
        options={TAB_OPTIONS}
        value={tab}
        onChange={setTab}
      />

      {/* AQI legend — page-level, visible across both tabs */}
      <div className="px-1">
        <AqiLegend
          aqiConfig={aqiConfig}
          collapsible
          className="max-w-3xl"
        />
      </div>

      {tab === 'live' ? (
        <>
          {/* Filter controls — compact, organized in one row */}
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 p-3">
              <div className="flex items-center gap-2">
                <SegmentedTabs
                  ariaLabel="Ranking level"
                  options={LEVEL_OPTIONS}
                  value={level}
                  onChange={setLevel}
                  size="sm"
                />
                <SegmentedTabs
                  ariaLabel="Ranking sort order"
                  options={SORT_OPTIONS}
                  value={sort}
                  onChange={setSort}
                  size="sm"
                />
              </div>
              <select
                aria-label="Number of entries"
                value={limit}
                onChange={event =>
                  setLimit(Number(event.target.value) || 20)
                }
                className="h-7 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1d1f20] px-2 py-0.5 text-xs"
              >
                {LIMIT_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    Top {option}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <RankingsSummaryCards
            rankings={rankings}
            aqiConfig={aqiConfig ?? null}
            isLoading={rankingsLoading || aqiConfigLoading}
          />

          <RankingsLeaderboard
            rankings={rankings}
            aqiConfig={aqiConfig ?? null}
            isLoading={rankingsLoading}
            error={rankingsError}
            onRetry={() => void refetchRankings()}
          />
        </>
      ) : (
        <>
          <Card>
            <CardContent className="p-3">
              <RankingsHistoryFilters
                level={historyLevel}
                startYear={startYear}
                endYear={endYear}
                onLevelChange={setHistoryLevel}
                onStartYearChange={setStartYear}
                onEndYearChange={setEndYear}
                disabled={historyLoading}
              />
            </CardContent>
          </Card>

          <RankingsHistoryChart
            history={history}
            aqiConfig={aqiConfig ?? null}
            isLoading={historyLoading}
          />

          <RankingsHistoryTable
            history={history}
            aqiConfig={aqiConfig ?? null}
            isLoading={historyLoading}
            error={historyError}
            onRetry={() => void refetchHistory()}
          />
        </>
      )}
    </div>
  );
};

export default AirQualityRankingsPage;
