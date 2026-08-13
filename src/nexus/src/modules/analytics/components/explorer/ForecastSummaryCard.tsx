'use client';

import React, { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { cn } from '@/shared/lib/utils';
import { AqSun, AqChevronDown, AqCloudOff } from '@airqo/icons-react';
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
  /** Device names for device-resolved sites (siteId → device name) */
  deviceNames?: Map<string, string>;
  className?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const formatDayHeading = (item: { date: string }, index: number) => {
  const date = new Date(item.date);
  const daysAhead = Number.isNaN(date.getTime())
    ? index
    : Math.round((date.getTime() - Date.now()) / DAY_MS);
  const prefix =
    daysAhead <= 0
      ? 'Today'
      : daysAhead === 1
        ? 'Tomorrow'
        : `Day ${daysAhead}`;
  if (Number.isNaN(date.getTime())) return prefix;
  return `${prefix} · ${date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })}`;
};

interface SiteDayValue {
  siteId: string;
  name: string;
  pm25: number;
  aqiCategory?: string;
  aqiColor?: string;
  aqiLabel?: string;
  trendMessage?: string | null;
}

interface DaySummary {
  date: string;
  values: SiteDayValue[];
  average: number;
  /** API-provided AQI metadata for the worst site on this day */
  worstAqiCategory?: string;
  worstAqiColor?: string;
  worstAqiLabel?: string;
  worstTrendMessage?: string | null;
}

/**
 * Textual summary of the upcoming forecast across ALL of the chart's sites.
 * The forecast endpoint accepts one site per request, so this card fires one
 * query per selected site (deduped against the main chart's overlay via the
 * shared query key) and aggregates them by day. Kept deliberately compact:
 * the forecast projection itself is drawn on the main chart.
 */
export const ForecastSummaryCard: React.FC<ForecastSummaryCardProps> = ({
  siteIds,
  siteNames,
  deviceNames,
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

  const itemsBySite = useMemo(
    () =>
      siteIds.map((siteId, index) => {
        const query = forecastQueries[index];
        // Name resolution: device name when the site was picked via Devices,
        // else the picker's site name, else the forecast API's OWN site name
        // (site_details.site_name) — raw ids must never surface.
        const apiSiteName =
          query?.data?.data?.forecasts?.[0]?.site_details?.site_name ?? '';
        return {
          siteId,
          name:
            deviceNames?.get(siteId) ??
            siteNames?.get(siteId) ??
            apiSiteName ??
            siteId,
          items: query?.data?.data?.forecasts?.[0]?.forecasts ?? [],
          failed: Boolean(query?.error),
        };
      }),
    [siteIds, siteNames, deviceNames, forecastQueries]
  );

  // A single failing site must never blank the whole summary — aggregate
  // whatever loaded and surface a partial note instead.
  const loadedSites = itemsBySite.filter(
    ({ items, failed }) => !failed && items.length > 0
  );
  const isLoading =
    forecastQueries.some(query => query.isLoading) && loadedSites.length === 0;
  const error =
    itemsBySite.length > 0 && loadedSites.length === 0
      ? (forecastQueries.find(query => query.error)?.error ?? null)
      : null;
  const failedCount = itemsBySite.filter(site => site.failed).length;

  // Aggregate per day across all sites — the union of returned dates (every
  // day the API returns, no fixed cap). AQI metadata comes straight from the
  // API response (per-day, per-site) and is stored on the worst site entry.
  const days = useMemo<DaySummary[]>(() => {
    const byDate = new Map<string, DaySummary>();
    loadedSites.forEach(({ siteId, name, items }) => {
      items.forEach((item: DailyForecastItem) => {
        const pm25 = resolveParsedNumber(item.forecast?.pm2_5_mean);
        if (pm25 === undefined || !Number.isFinite(pm25)) return;
        const day = String(item.date ?? '').slice(0, 10);
        if (!day) return;
        const summary = byDate.get(day) ?? { date: day, values: [], average: 0 };
        summary.values.push({
          siteId,
          name,
          pm25,
          aqiCategory: item.aqi?.aqi_category ?? undefined,
          aqiColor: item.aqi?.aqi_color ?? undefined,
          aqiLabel: item.aqi?.label ?? undefined,
          trendMessage: item.aqi?.trend_message ?? null,
        });
        byDate.set(day, summary);
      });
    });
    return Array.from(byDate.values())
      .map(summary => {
        const average =
          summary.values.reduce((sum, value) => sum + value.pm25, 0) /
          summary.values.length;
        // Find the worst site (highest PM2.5) and use its API-provided AQI metadata
        const worst = summary.values.reduce((worstSoFar, value) =>
          value.pm25 > worstSoFar.pm25 ? value : worstSoFar
        );
        return {
          ...summary,
          average,
          worstAqiCategory: worst.aqiCategory,
          worstAqiColor: worst.aqiColor,
          worstAqiLabel: worst.aqiLabel,
          worstTrendMessage: worst.trendMessage,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(1); // Skip today — the projection starts after NOW.
  }, [loadedSites]);

  const peak = useMemo(() => {
    if (days.length === 0) return null;
    let best: DaySummary = days[0];
    days.forEach(day => {
      if (day.average > best.average) best = day;
    });
    const worstLocation = best.values.reduce((worst, value) =>
      value.pm25 > worst.pm25 ? value : worst
    );
    return { day: best, worstLocation };
  }, [days]);

  const showBody = !isLoading && !error && days.length > 0;

  return (
    <Card className={cn('w-full', className)}>
      <div>
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
        >
          <span className="flex min-w-0 items-center gap-2">
            <AqSun className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="text-sm font-semibold text-foreground">
              Forecast summary
            </span>
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              PM₂.₅ only
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
            {expanded ? 'Hide details' : 'View details'}
            <AqChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200 motion-reduce:transition-none',
                expanded && 'rotate-180'
              )}
            />
          </span>
        </button>

        <div
          className={cn(
            'transition-[max-height,opacity] duration-300 ease-in-out motion-reduce:transition-none',
            expanded
              ? 'max-h-[600px] overflow-y-auto opacity-100'
              : 'max-h-0 overflow-hidden opacity-0'
          )}
          aria-hidden={!expanded}
        >
          <CardContent className="px-4 pb-4 pt-0">
            <p className="mb-3 text-xs text-muted-foreground">
              {days.length > 0
                ? `Next ${days.length} day${days.length === 1 ? '' : 's'} outlook across ${loadedSites.length} location${loadedSites.length === 1 ? '' : 's'}`
                : 'Outlook for the selected locations'}
              {failedCount > 0 && days.length > 0 && (
                <span className="mt-0.5 block text-[11px] text-amber-600 dark:text-amber-400">
                  Forecast unavailable for {failedCount} location
                  {failedCount === 1 ? '' : 's'}.
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
                Unable to load forecast data
              </div>
            )}

            {!isLoading && !error && days.length === 0 && (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <AqCloudOff className="h-5 w-5" />
                No forecast data available
              </div>
            )}

            {showBody && (
              <div className="space-y-1.5">
                {days.map((day, index) => {
                  // Prefer API-provided AQI color; fall back to computed
                  const apiColor = day.worstAqiColor;
                  const computedInfo = getAirQualityInfo(
                    day.average,
                    'pm2_5',
                    'WHO',
                    pm25AqiConfig
                  );
                  const aqiColor =
                    apiColor || getAirQualityColor(computedInfo.level, pm25AqiConfig);
                  const aqiCategoryLabel =
                    day.worstAqiCategory || computedInfo.label;
                  const highestLocation = day.values.reduce((worst, value) =>
                    value.pm25 > worst.pm25 ? value : worst
                  );
                  return (
                    <div
                      key={day.date}
                      className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-1.5"
                    >
                      <span className="min-w-0 text-sm font-medium text-foreground">
                        {formatDayHeading(day, index + 1)}
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
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: aqiColor || undefined }}
                          />
                          {aqiCategoryLabel}
                        </span>
                        {highestLocation && (
                          <span className="hidden max-w-[140px] truncate text-[10px] sm:inline">
                            risk: {highestLocation.name}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}

                {peak && (
                  <p className="pt-1 text-xs text-muted-foreground">
                    Highest forecast:{' '}
                    <span className="font-semibold text-foreground">
                      {peak.day.average.toFixed(1)} μg/m³
                    </span>{' '}
                    on {formatDayHeading(peak.day, days.indexOf(peak.day) + 1)}
                    {peak.worstLocation && (
                      <>
                        {' '}
                        · highest-risk location:{' '}
                        <span className="font-medium text-foreground">
                          {peak.worstLocation.name}
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
