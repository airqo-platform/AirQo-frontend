'use client';

import React, { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { cn } from '@/shared/lib/utils';
import {
  AqSun,
  AqChevronDown,
  AqCloudOff,
  AqInfoCircle,
} from '@airqo/icons-react';
import { Tooltip } from 'flowbite-react';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { deviceService } from '@/shared/services/deviceService';
import {
  getAirQualityInfo,
  getAirQualityColor,
} from '@/shared/utils/airQuality';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { Card, CardContent } from '@/shared/components/ui/card';
import { resolveParsedNumber } from '@/shared/types/api';
import type { DailyForecastItem } from '@/shared/types/api';

interface ForecastSummaryCardProps {
  /** The forecast API is per-site — one request per selected site */
  siteIds: string[];
  /** Display names for sites (picker names) */
  siteNames?: Map<string, string>;
  className?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** UTC calendar key (YYYY-MM-DD) for a date string — the forecast API's date space */
const toUtcDayKey = (iso: string): string => String(iso ?? '').slice(0, 10);

/**
 * Whole calendar days between two UTC date keys. Exact integer math in the
 * UTC date space — never `Math.round` on timezone-shifted milliseconds, so a
 * forecast date can't be mislabeled as "today" just because the client clock
 * is a few hours ahead of UTC.
 */
const daysBetweenUtcKeys = (fromKey: string, toKey: string): number =>
  // Both operands are pinned to `T00:00:00.000Z`, so the difference is an
  // exact multiple of DAY_MS — plain division is already integer-exact.
  (Date.parse(`${toKey}T00:00:00.000Z`) -
    Date.parse(`${fromKey}T00:00:00.000Z`)) /
  DAY_MS;

const formatDayHeading = (dateKey: string, daysAhead: number) => {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  const prefix =
    daysAhead <= 0
      ? 'Today'
      : daysAhead === 1
        ? 'Tomorrow'
        : `Day ${daysAhead}`;
  if (Number.isNaN(date.getTime())) return prefix;
  // Format in UTC so the calendar date can never shift to the previous day
  // in a negative-offset timezone.
  return `${prefix} · ${date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })}`;
};

interface SiteForecast {
  siteId: string;
  name: string;
  items: DailyForecastItem[];
  failed: boolean;
}

interface SiteDayValue {
  siteId: string;
  name: string;
  pm25: number;
}

interface DaySummary {
  /** UTC calendar key (YYYY-MM-DD) from the API response */
  date: string;
  /** Whole days ahead of today (1 = tomorrow) */
  daysAhead: number;
  values: SiteDayValue[];
  average: number;
  worstSite: SiteDayValue;
}

/**
 * Textual summary of the upcoming forecast across ALL of the chart's sites.
 * The forecast endpoint accepts one site per request, so this card fires one
 * query per selected site (deduped against the main chart's overlay via the
 * shared query key) and aggregates them by day. Day values are the AVERAGE
 * across the locations that actually returned a forecast — locations without
 * one are listed by name, never silently dropped. All colors/icons come from
 * the shared AQI utilities so the summary matches the rest of the app.
 */
export const ForecastSummaryCard: React.FC<ForecastSummaryCardProps> = ({
  siteIds,
  siteNames,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { config: pm25AqiConfig } = useAqiConfig('pm2_5');

  // Fetch only when expanded. Query keys are shared with the main chart's
  // forecast overlay, so data fetched there (or on a previous expansion) is
  // served straight from the React Query cache — no repeated API calls.
  // Longer staleTime keeps the forecast usable across toggles without
  // re-firing requests.
  const forecastQueries = useQueries({
    queries: siteIds.map(siteId => ({
      queryKey: ['map', 'forecast', 'daily', siteId],
      queryFn: async ({ signal }) =>
        deviceService.getDailyForecast(siteId, signal),
      enabled: !!siteId && expanded,
      networkMode: 'online',
      retry: false,
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60 * 12,
    })),
  });

  const itemsBySite = useMemo<SiteForecast[]>(
    () =>
      siteIds.map((siteId, index) => {
        const query = forecastQueries[index];
        // Name resolution: the picker's site name, else the forecast API's
        // OWN site name (site_details.site_name) — raw ids must never
        // surface.
        const apiSiteName =
          query?.data?.data?.forecasts?.[0]?.site_details?.site_name ?? '';
        return {
          siteId,
          name: siteNames?.get(siteId) ?? apiSiteName ?? siteId,
          items: query?.data?.data?.forecasts?.[0]?.forecasts ?? [],
          failed: Boolean(query?.error),
        };
      }),
    [siteIds, siteNames, forecastQueries]
  );

  // A single failing site must never blank the whole summary — aggregate
  // whatever loaded and surface a partial note instead.
  const loadedSites = useMemo(
    () =>
      itemsBySite.filter(({ items, failed }) => !failed && items.length > 0),
    [itemsBySite]
  );

  // Sites with NO forecast (error or empty payload), listed by name so users
  // know exactly which locations are missing and why averages may be partial.
  const missingSites = useMemo(
    () =>
      itemsBySite
        .filter(({ items, failed }) => failed || items.length === 0)
        .map(({ name }) => name),
    [itemsBySite]
  );

  const isLoading =
    forecastQueries.some(query => query.isLoading) && loadedSites.length === 0;
  const error =
    itemsBySite.length > 0 && loadedSites.length === 0
      ? (forecastQueries.find(query => query.error)?.error ?? null)
      : null;

  // Aggregate per day across all sites. "Today" (and anything in the past)
  // is dropped — the projection starts after NOW — using exact calendar
  // math in the API's UTC date space, so day labels can never drift.
  const days = useMemo<DaySummary[]>(() => {
    const todayKey = toUtcDayKey(new Date().toISOString());
    type DayAccumulator = Omit<DaySummary, 'average' | 'worstSite'>;
    const byDate = new Map<string, DayAccumulator>();
    loadedSites.forEach(({ siteId, name, items }) => {
      items.forEach((item: DailyForecastItem) => {
        const pm25 = resolveParsedNumber(item.forecast?.pm2_5_mean);
        if (pm25 === undefined || !Number.isFinite(pm25)) return;
        const date = toUtcDayKey(item.date);
        if (!date) return;
        const daysAhead = daysBetweenUtcKeys(todayKey, date);
        if (!Number.isFinite(daysAhead) || daysAhead <= 0) return;
        const summary = byDate.get(date) ?? { date, daysAhead, values: [] };
        summary.values.push({ siteId, name, pm25 });
        byDate.set(date, summary);
      });
    });
    return Array.from(byDate.values())
      .map(summary => {
        const average =
          summary.values.reduce((sum, value) => sum + value.pm25, 0) /
          summary.values.length;
        const worstSite = summary.values.reduce((worst, value) =>
          value.pm25 > worst.pm25 ? value : worst
        );
        return { ...summary, average, worstSite };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [loadedSites]);

  const peak = useMemo(() => {
    if (days.length === 0) return null;
    let best: DaySummary = days[0];
    days.forEach(day => {
      if (day.average > best.average) best = day;
    });
    return best;
  }, [days]);

  const showBody = !isLoading && !error && days.length > 0;
  const totalSites = loadedSites.length;

  return (
    <Card className={cn('w-full', className)}>
      <div>
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            aria-expanded={expanded}
            aria-controls="forecast-summary-panel"
            className="flex min-w-0 items-center gap-2 text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <AqSun className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="text-sm font-semibold text-foreground">
              Forecast summary
            </span>
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              PM₂.₅ only
            </span>
          </button>

          <Tooltip
            content={
              <div className="max-w-[280px] space-y-1 text-left">
                <p className="text-xs font-semibold text-white">
                  How this summary works
                </p>
                <p className="text-xs text-gray-200">
                  Daily-mean PM2.5 projections from the AirQo forecast model,
                  one per day and location.
                </p>
                <p className="text-xs text-gray-200">
                  Each day shows the AVERAGE across the locations with forecast
                  data. Days where some locations are missing are marked with
                  their coverage; locations without a forecast are listed below
                  and excluded from averages.
                </p>
              </div>
            }
            placement="top"
          >
            <button
              type="button"
              aria-label="How this summary works"
              className="inline-flex shrink-0 cursor-help rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <AqInfoCircle className="h-4 w-4 text-muted-foreground" />
            </button>
          </Tooltip>

          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            aria-expanded={expanded}
            aria-controls="forecast-summary-panel"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            {expanded ? 'Hide details' : 'View details'}
            <AqChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200 motion-reduce:transition-none',
                expanded && 'rotate-180'
              )}
            />
          </button>
        </div>

        <div
          id="forecast-summary-panel"
          className={cn(
            'transition-[max-height,opacity,visibility] duration-300 ease-in-out motion-reduce:transition-none',
            expanded
              ? 'max-h-[600px] overflow-y-auto opacity-100'
              : 'invisible max-h-0 overflow-hidden opacity-0'
          )}
          aria-hidden={!expanded}
        >
          <CardContent className="px-4 pb-4 pt-0">
            <p className="mb-3 text-xs text-muted-foreground">
              {days.length > 0
                ? `Next ${days.length} day${days.length === 1 ? '' : 's'} outlook across ${totalSites} location${totalSites === 1 ? '' : 's'}`
                : 'Outlook for the selected locations'}
              {missingSites.length > 0 && loadedSites.length > 0 && (
                <span className="mt-1 block rounded-md border border-amber-300/40 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-300">
                  Forecast unavailable for:{' '}
                  <span className="font-semibold">
                    {missingSites.join(', ')}
                  </span>{' '}
                  — excluded from the averages below.
                </span>
              )}
            </p>

            {isLoading && (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <LoadingSpinner size={18} /> Loading forecast...
              </div>
            )}

            {!isLoading && error && (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <AqCloudOff className="h-5 w-5" />
                Forecast is currently unavailable for the selected locations.
              </div>
            )}

            {!isLoading && !error && days.length === 0 && (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <AqCloudOff className="h-5 w-5" />
                {loadedSites.length > 0
                  ? 'Forecast covers today only — no upcoming days available.'
                  : 'No forecast data available'}
              </div>
            )}

            {showBody && (
              <div className="space-y-1.5">
                {days.map(day => {
                  // Badge from the SHARED AQI utilities so the color, label
                  // and icon match the rest of the app — computed from the
                  // day's average (the number shown), never an API color
                  // that could disagree with it.
                  const info = getAirQualityInfo(
                    day.average,
                    'pm2_5',
                    'WHO',
                    pm25AqiConfig
                  );
                  const aqiColor = getAirQualityColor(
                    info.level,
                    pm25AqiConfig
                  );
                  const Icon = info.icon;
                  const isPartial = day.values.length < totalSites;
                  return (
                    <div
                      key={day.date}
                      className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-1.5"
                    >
                      <span className="min-w-0 text-sm font-medium text-foreground">
                        {formatDayHeading(day.date, day.daysAhead)}
                        {isPartial && (
                          <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                            ({day.values.length}/{totalSites} sites)
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                        <span className="tabular-nums font-semibold text-foreground">
                          {day.average.toFixed(1)} μg/m³
                        </span>
                        <span
                          className="flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium"
                          style={{
                            color: aqiColor || undefined,
                            backgroundColor: aqiColor
                              ? `${aqiColor}1a`
                              : undefined,
                          }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {info.label}
                        </span>
                        {day.worstSite && (
                          <span className="hidden max-w-[140px] truncate text-[10px] sm:inline">
                            risk: {day.worstSite.name}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}

                {peak && (
                  <p className="pt-1 text-xs text-muted-foreground">
                    Highest average forecast:{' '}
                    <span className="font-semibold text-foreground">
                      {peak.average.toFixed(1)} μg/m³
                    </span>{' '}
                    on {formatDayHeading(peak.date, peak.daysAhead)}
                    {peak.worstSite && (
                      <>
                        {' '}
                        · highest-risk location:{' '}
                        <span className="font-medium text-foreground">
                          {peak.worstSite.name}
                        </span>
                      </>
                    )}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default ForecastSummaryCard;
