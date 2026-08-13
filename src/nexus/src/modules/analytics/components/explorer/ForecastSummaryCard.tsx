'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/shared/lib/utils';
import {
  AqSun,
  AqChevronDown,
} from '@airqo/icons-react';
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
  siteIds: string[];
  siteNames?: Map<string, string>;
  className?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const toUtcDayKey = (iso: string): string => String(iso ?? '').slice(0, 10);

const daysBetweenUtcKeys = (fromKey: string, toKey: string): number =>
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
  return `${prefix} · ${date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })}`;
};

interface DaySummary {
  date: string;
  daysAhead: number;
  average: number;
}

function buildDaySummaries(
  forecasts: DailyForecastItem[]
): DaySummary[] {
  const todayKey = toUtcDayKey(new Date().toISOString());
  const byDate = new Map<string, DaySummary>();

  forecasts.forEach(item => {
    const pm25 = resolveParsedNumber(item.forecast?.pm2_5_mean);
    if (pm25 === undefined || !Number.isFinite(pm25)) return;
    const date = toUtcDayKey(item.date);
    if (!date) return;
    const daysAhead = daysBetweenUtcKeys(todayKey, date);
    if (!Number.isFinite(daysAhead) || daysAhead <= 0) return;
    if (!byDate.has(date)) {
      byDate.set(date, { date, daysAhead, average: pm25 });
    }
  });

  return Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export const ForecastSummaryCard: React.FC<ForecastSummaryCardProps> = ({
  siteIds,
  siteNames,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string>(siteIds[0] ?? '');
  const { config: pm25AqiConfig } = useAqiConfig('pm2_5');

  // Only fetch the currently selected site — avoids parallel per-site calls.
  const { data, isLoading, error } = useQuery({
    queryKey: ['map', 'forecast', 'daily', selectedSite],
    queryFn: async ({ signal }) =>
      deviceService.getDailyForecast(selectedSite, signal),
    enabled: !!selectedSite && expanded,
    networkMode: 'online',
    retry: false,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 12,
  });

  const siteDisplayName = useMemo(() => {
    const apiName =
      data?.data?.forecasts?.[0]?.site_details?.site_name ?? '';
    return siteNames?.get(selectedSite) ?? apiName ?? selectedSite;
  }, [data, selectedSite, siteNames]);

  const forecasts = useMemo(
    () => data?.data?.forecasts?.[0]?.forecasts ?? [],
    [data]
  );

  const days = useMemo(() => buildDaySummaries(forecasts), [forecasts]);

  const peak = useMemo(() => {
    if (days.length === 0) return null;
    let best: DaySummary = days[0];
    days.forEach(day => {
      if (day.average > best.average) best = day;
    });
    return best;
  }, [days]);

  const showBody = !isLoading && !error && days.length > 0;

  return (
    <Card className={cn('w-full', className)}>
      <div>
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          aria-expanded={expanded}
          aria-controls="forecast-summary-panel"
          className="flex w-full items-center gap-2 px-4 py-3 text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <AqSun className="h-4 w-4 shrink-0 text-amber-500" />
          <span className="text-sm font-semibold text-foreground">
            Forecast summary
          </span>
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            PM₂.₅ only
          </span>
          <AqChevronDown
            className={cn(
              'ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none',
              expanded && 'rotate-180'
            )}
          />
        </button>

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
            {/* ── Site selector tabs ──────────────────────────────── */}
            {siteIds.length > 1 && (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {siteIds.map(id => {
                  const isActive = selectedSite === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedSite(id)}
                      className={cn(
                        'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      )}
                      aria-pressed={isActive}
                    >
                      {siteNames?.get(id) ?? id}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Subtitle ───────────────────────────────────────── */}
            <p className="mb-3 text-xs text-muted-foreground">
              {days.length > 0
                ? `Next ${days.length} day${days.length === 1 ? '' : 's'} forecast for ${siteDisplayName}`
                : `Forecast for ${siteDisplayName}`}
            </p>

            {/* ── Loading state ─────────────────────────────────── */}
            {isLoading && (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <LoadingSpinner size={18} /> Loading forecast…
              </div>
            )}

            {/* ── Unavailable warning ────────────────────────────── */}
            {!isLoading && (error || days.length === 0) && (
              <span className="mb-3 block rounded-md border border-amber-300/40 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-300">
                Forecast is not available for{' '}
                <span className="font-semibold">{siteDisplayName}</span> — no
                prediction data has been generated for this location yet.
              </span>
            )}

            {/* ── Day-by-day rows ─────────────────────────────────── */}
            {showBody && (
              <div className="space-y-1.5">
                {days.map(day => {
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
                  return (
                    <div
                      key={day.date}
                      className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-1.5"
                    >
                      <span className="min-w-0 text-sm font-medium text-foreground">
                        {formatDayHeading(day.date, day.daysAhead)}
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
                      </span>
                    </div>
                  );
                })}

                {peak && (
                  <p className="pt-1 text-xs text-muted-foreground">
                    Highest forecast:{' '}
                    <span className="font-semibold text-foreground">
                      {peak.average.toFixed(1)} μg/m³
                    </span>{' '}
                    on {formatDayHeading(peak.date, peak.daysAhead)}
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
