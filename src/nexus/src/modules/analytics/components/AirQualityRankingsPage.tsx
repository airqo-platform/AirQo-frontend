'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { capturePostHogEvent, trackEvent } from '@/shared/utils/analytics';
import { cn } from '@/shared/lib/utils';
import PageHeading from '@/shared/components/ui/page-heading';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import { AqRefreshCcw01 } from '@airqo/icons-react';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { useHomeStart } from '@/shared/hooks/useHomeStart';
import { useRankings } from '../hooks/useRankings';
import { useRankingsHistory } from '../hooks/useRankingsHistory';
import { useRankingCountries } from '../hooks/useRankingCountries';
import { AqiLegend } from './explorer/AqiLegend';
import { AiDrawerTrigger } from '@/modules/ai/components/AiDrawerTrigger';
import {
  RankingsHistoryFilters,
  RankingsSummaryCards,
  RankingsLeaderboard,
  RankingsHistoryTable,
  RankingsHistoryChart,
} from './rankings';
import type { RankingsLevel, RankingsSort } from '@/shared/types/api';

type RankingsTab = 'live' | 'history';

const RANKINGS_TAB_STORAGE_KEY = 'nexus:rankings:tab';

// The active tab survives reloads: read lazily (guarded for SSR) and persist
// on change so a refreshed page returns to the same tab.
const readStoredRankingsTab = (): RankingsTab => {
  if (typeof window === 'undefined') return 'live';
  try {
    const stored = window.localStorage.getItem(RANKINGS_TAB_STORAGE_KEY);
    return stored === 'live' || stored === 'history' ? stored : 'live';
  } catch {
    return 'live';
  }
};

const TAB_OPTIONS: { value: RankingsTab; label: string }[] = [
  { value: 'live', label: 'Live rankings' },
  { value: 'history', label: 'Historical comparison' },
];

const LEVEL_OPTIONS: { value: RankingsLevel; label: string }[] = [
  { value: 'country', label: 'Country' },
  { value: 'city', label: 'City' },
];

const SORT_OPTIONS: { value: RankingsSort; label: string }[] = [
  { value: 'worst', label: 'Most polluted first' },
  { value: 'best', label: 'Cleanest first' },
];

const LIMIT_OPTIONS = [10, 20, 50, 100];
const DEFAULT_LIMIT = 20;

const trackRankingsFilterChange = (
  view: RankingsTab,
  filter: string,
  value: string | number
) => {
  trackEvent('air_quality_rankings_filter_changed', {
    view,
    filter,
    value,
  });
};

interface AirQualityRankingsPageProps {
  className?: string;
}

/**
 * Air Quality Rankings — the African AQI leaderboard.
 *
 * The AQI legend is placed at the page level (above the leaderboard) so it
 * stays visible across both the live and historical tabs without repeating.
 */
export const AirQualityRankingsPage: React.FC<AirQualityRankingsPageProps> = ({
  className,
}) => {
  const posthog = usePostHog();
  const { config: aqiConfig, isLoading: aqiConfigLoading } =
    useAqiConfig('pm2_5');

  const homeStart = useHomeStart();

  const [tab, setTab] = useState<RankingsTab>(() => {
    const storedTab = readStoredRankingsTab();
    return homeStart === 'view-rankings' ? 'live' : storedTab;
  });
  const [level, setLevel] = useState<RankingsLevel>('country');
  // The rankings entry point promises the cleanest locations first. Users can
  // still switch to the most polluted view explicitly.
  const [sort, setSort] = useState<RankingsSort>('best');
  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);
  const [country, setCountry] = useState<string>('');
  const searchTrackingTimerRef = React.useRef<number | null>(null);

  const scheduleSearchTracking = useCallback(
    (view: RankingsTab, term: string) => {
      if (searchTrackingTimerRef.current !== null) {
        window.clearTimeout(searchTrackingTimerRef.current);
      }

      searchTrackingTimerRef.current = window.setTimeout(() => {
        const normalizedTerm = term.trim();
        trackEvent('air_quality_rankings_search_changed', {
          view,
          has_query: normalizedTerm.length > 0,
          query_length: normalizedTerm.length,
        });
      }, 500);
    },
    []
  );

  useEffect(
    () => () => {
      if (searchTrackingTimerRef.current !== null) {
        window.clearTimeout(searchTrackingTimerRef.current);
      }
    },
    []
  );

  const handleLiveSearchChange = useCallback(
    (term: string) => scheduleSearchTracking('live', term),
    [scheduleSearchTracking]
  );

  const handleHistorySearchChange = useCallback(
    (term: string) => scheduleSearchTracking('history', term),
    [scheduleSearchTracking]
  );

  const handleLivePageChange = useCallback((page: number) => {
    trackEvent('air_quality_rankings_page_changed', {
      view: 'live',
      page,
    });
  }, []);

  const handleHistoryPageChange = useCallback((page: number) => {
    trackEvent('air_quality_rankings_page_changed', {
      view: 'history',
      page,
    });
  }, []);

  const handleHistorySortChange = useCallback(
    (sortState: { key: string; direction: 'asc' | 'desc' }) => {
      trackEvent('air_quality_rankings_sort_changed', {
        view: 'history',
        column: sortState.key,
        direction: sortState.direction,
      });
    },
    []
  );

  const handleLivePageSizeChange = useCallback((pageSize: number) => {
    trackEvent('air_quality_rankings_page_size_changed', {
      view: 'live',
      page_size: pageSize,
    });
  }, []);

  const handleHistoryPageSizeChange = useCallback((pageSize: number) => {
    trackEvent('air_quality_rankings_page_size_changed', {
      view: 'history',
      page_size: pageSize,
    });
  }, []);

  // The rankings tour describes the live controls. A saved history tab would
  // leave those targets unmounted, so enter the live tab before the guide opens.
  useEffect(() => {
    if (homeStart === 'view-rankings') setTab('live');
  }, [homeStart]);

  // Persist the active tab so a refresh returns to the same view.
  useEffect(() => {
    try {
      window.localStorage.setItem(RANKINGS_TAB_STORAGE_KEY, tab);
    } catch {
      // Storage unavailable — tab memory is best-effort.
    }
  }, [tab]);

  const [historyLevel, setHistoryLevel] = useState<RankingsLevel>('country');
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState<number>(currentYear - 2);
  const [endYear, setEndYear] = useState<number>(currentYear);

  const {
    rankings,
    rankingsMeta,
    isLoading: rankingsLoading,
    isRefreshing,
    error: rankingsError,
    refetch: refetchRankings,
  } = useRankings(
    {
      level,
      sort,
      limit,
      country: level === 'city' && country ? country : undefined,
    },
    tab === 'live'
  );

  // Fetch the two extremes independently from the visible page slice. This
  // keeps the summary cards accurate when the table is limited to the
  // cleanest or most polluted subset of locations.
  const {
    rankings: cleanestRankings,
    isLoading: cleanestRankingsLoading,
    isRefreshing: cleanestRankingsRefreshing,
    refetch: refetchCleanestRankings,
  } = useRankings(
    {
      level,
      sort: 'best',
      limit: 1,
      country: level === 'city' && country ? country : undefined,
    },
    tab === 'live'
  );

  const {
    rankings: mostPollutedRankings,
    isLoading: mostPollutedRankingsLoading,
    isRefreshing: mostPollutedRankingsRefreshing,
    refetch: refetchMostPollutedRankings,
  } = useRankings(
    {
      level,
      sort: 'worst',
      limit: 1,
      country: level === 'city' && country ? country : undefined,
    },
    tab === 'live'
  );

  const {
    history,
    isLoading: historyLoading,
    isRefreshing: historyRefreshing,
    error: historyError,
    refetch: refetchHistory,
  } = useRankingsHistory(
    {
      level: historyLevel,
      start_year: startYear,
      end_year: endYear,
      country: historyLevel === 'city' && country ? country : undefined,
    },
    tab === 'history'
  );

  const showCountryFilter =
    (tab === 'live' && level === 'city') ||
    (tab === 'history' && historyLevel === 'city');

  const { countries, isLoading: countriesLoading } =
    useRankingCountries(showCountryFilter);

  const selectedCountryName = country
    ? (countries.find(c => c.country_code === country)?.country_name ?? null)
    : null;

  const selectedHistoryFrom = country
    ? (countries.find(c => c.country_code === country)?.history_from ?? null)
    : null;

  useEffect(() => {
    capturePostHogEvent(posthog, 'air_quality_rankings_viewed', {
      tab,
      level: tab === 'live' ? level : historyLevel,
      country: showCountryFilter && country ? country : 'all',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleRefresh = useCallback(
    async (source: 'page_heading' | 'table' = 'page_heading') => {
      trackEvent('air_quality_rankings_refresh_requested', {
        view: tab,
        source,
      });

      if (tab === 'live') {
        await Promise.all([
          refetchRankings(),
          refetchCleanestRankings(),
          refetchMostPollutedRankings(),
        ]);
      } else {
        await refetchHistory();
      }
    },
    [
      tab,
      refetchCleanestRankings,
      refetchHistory,
      refetchMostPollutedRankings,
      refetchRankings,
    ]
  );

  const isRefreshingAny =
    tab === 'live'
      ? isRefreshing ||
        cleanestRankingsRefreshing ||
        mostPollutedRankingsRefreshing
      : historyRefreshing;

  return (
    <div className={cn('space-y-6', className)}>
      <PageHeading
        title="Air Quality Rankings"
        subtitle="Compare recent average PM2.5 across African countries and cities. Cleanest locations appear first by default, with an explicit most-polluted view when needed."
        infoLine="Only locations with a reading from the last 3 days are ranked. Years without data in the historical view are shown as a dash — not as clean air."
        action={
          <div className="flex items-center gap-2">
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
            <AiDrawerTrigger />
          </div>
        }
      />

      {/* Tab switcher — wrapped in a card, sized to content */}
      <Card className="w-fit">
        <CardContent className="p-2">
          <SegmentedTabs
            ariaLabel="Rankings views"
            options={TAB_OPTIONS}
            value={tab}
            onChange={nextTab => {
              if (nextTab !== tab) {
                trackEvent('air_quality_rankings_tab_changed', {
                  from_tab: tab,
                  to_tab: nextTab,
                });
                setTab(nextTab);
              }
            }}
          />
        </CardContent>
      </Card>

      {/* AQI legend — page-level, visible across both tabs */}
      <AqiLegend aqiConfig={aqiConfig} />

      {tab === 'live' ? (
        <>
          {/* Filter controls — compact, organized in one row */}
          <Card data-tour="rankings-controls">
            <CardContent className="flex flex-wrap items-center gap-3 p-3">
              <div className="flex items-center gap-2">
                <SegmentedTabs
                  ariaLabel="Ranking level"
                  options={LEVEL_OPTIONS}
                  value={level}
                  onChange={nextLevel => {
                    trackRankingsFilterChange('live', 'level', nextLevel);
                    setLevel(nextLevel);
                  }}
                  size="sm"
                />
                <SegmentedTabs
                  ariaLabel="Ranking sort order"
                  options={SORT_OPTIONS}
                  value={sort}
                  onChange={nextSort => {
                    trackRankingsFilterChange('live', 'sort', nextSort);
                    setSort(nextSort);
                  }}
                  size="sm"
                />
              </div>
              <select
                aria-label="Number of entries"
                value={limit}
                onChange={event => {
                  const nextLimit = Number(event.target.value) || DEFAULT_LIMIT;
                  trackRankingsFilterChange('live', 'limit', nextLimit);
                  setLimit(nextLimit);
                }}
                className="h-7 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1d1f20] px-2 py-0.5 text-xs"
              >
                {LIMIT_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    Top {option}
                  </option>
                ))}
              </select>
              {level === 'city' && (
                <select
                  aria-label="Country filter"
                  value={country}
                  onChange={event => {
                    const nextCountry = event.target.value;
                    trackRankingsFilterChange('live', 'country', nextCountry);
                    setCountry(nextCountry);
                  }}
                  disabled={countriesLoading}
                  className="h-7 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1d1f20] px-2 py-0.5 text-xs"
                >
                  <option value="">All countries</option>
                  {countries.map(c => (
                    <option key={c.country_code} value={c.country_code}>
                      {c.country_name}
                    </option>
                  ))}
                </select>
              )}
            </CardContent>
          </Card>

          <RankingsSummaryCards
            cleanestRanking={cleanestRankings[0] ?? null}
            mostPollutedRanking={mostPollutedRankings[0] ?? null}
            aqiConfig={aqiConfig ?? null}
            visibleCount={rankings.length}
            isLoading={
              rankingsLoading ||
              cleanestRankingsLoading ||
              mostPollutedRankingsLoading ||
              aqiConfigLoading
            }
            totalCount={rankingsMeta?.total ?? null}
          />

          <div data-tour="rankings-content">
            <RankingsLeaderboard
              rankings={rankings}
              aqiConfig={aqiConfig ?? null}
              isLoading={rankingsLoading}
              error={rankingsError}
              onRetry={() => void handleRefresh('table')}
              totalCount={rankingsMeta?.total ?? null}
              sort={sort}
              onSearchTermChange={handleLiveSearchChange}
              onClientPageChange={handleLivePageChange}
              onPageSizeChange={handleLivePageSizeChange}
            />
          </div>
        </>
      ) : (
        <>
          <Card>
            <CardContent className="p-3">
              <RankingsHistoryFilters
                level={historyLevel}
                startYear={startYear}
                endYear={endYear}
                onLevelChange={nextLevel => {
                  trackRankingsFilterChange('history', 'level', nextLevel);
                  setHistoryLevel(nextLevel);
                }}
                onStartYearChange={nextYear => {
                  trackRankingsFilterChange('history', 'start_year', nextYear);
                  setStartYear(nextYear);
                }}
                onEndYearChange={nextYear => {
                  trackRankingsFilterChange('history', 'end_year', nextYear);
                  setEndYear(nextYear);
                }}
                country={country}
                onCountryChange={nextCountry => {
                  trackRankingsFilterChange('history', 'country', nextCountry);
                  setCountry(nextCountry);
                }}
                countryOptions={countries}
                countryName={selectedCountryName}
                historyFrom={selectedHistoryFrom}
                countriesLoading={countriesLoading}
                disabled={historyLoading}
              />
            </CardContent>
          </Card>

          <RankingsHistoryChart
            history={history}
            aqiConfig={aqiConfig ?? null}
            isLoading={historyLoading}
            countryName={historyLevel === 'city' ? selectedCountryName : null}
          />

          <RankingsHistoryTable
            history={history}
            aqiConfig={aqiConfig ?? null}
            isLoading={historyLoading}
            error={historyError}
            onRetry={() => void handleRefresh('table')}
            onSearchTermChange={handleHistorySearchChange}
            onClientPageChange={handleHistoryPageChange}
            onClientSortChange={handleHistorySortChange}
            onPageSizeChange={handleHistoryPageSizeChange}
          />
        </>
      )}
    </div>
  );
};

export default AirQualityRankingsPage;
