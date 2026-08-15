'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { ChartContainer, DynamicChart } from '@/shared/components/charts';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import { Card, CardContent } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui';
import { TREND_PERIOD_PRESETS, type TrendPeriod } from '@/modules/analytics';
import { getPollutantLabel } from '@/shared/utils/airQuality';
import type { AqiConfig } from '@/shared/types/aqi';
import type { Site } from '@/shared/types/api';
import { getSiteDisplayName } from '@/shared/utils/siteUtils';
import type { NormalizedChartData } from '@/shared/components/charts/types';
import { useCohortHistoricalMeasurements } from '../hooks/useOrgMeasurements';
import {
  buildFleetDailySeries,
  buildSiteDailySeriesMap,
} from '../utils/measurements';
import type { Measurement, PollutantType } from '../types';

interface TrendSectionProps {
  cohortId?: string | null;
  selectedSites: Site[];
  pollutant: PollutantType;
  onPollutantChange?: (pollutant: PollutantType) => void;
  aqiConfig?: AqiConfig | null;
  enabled?: boolean;
  className?: string;
}

const POLLUTANT_OPTIONS: { value: PollutantType; label: string }[] = [
  { value: 'pm2_5', label: 'PM2.5' },
  { value: 'pm10', label: 'PM10' },
];

const PERIOD_OPTIONS: { value: string; label: string }[] =
  TREND_PERIOD_PRESETS.map(period => ({
    value: period.value,
    label: period.label,
  }));

const PERIOD_DAYS: Record<TrendPeriod, number> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
};

const FLEET_SERIES_KEY = 'Fleet average';

const buildSeriesData = (
  measurements: Measurement[],
  pollutant: PollutantType,
  selectedSites: Site[]
): {
  chartData: NormalizedChartData[];
  seriesNames: string[];
} => {
  const fleetSeries = buildFleetDailySeries(measurements, pollutant);
  const siteSeries = buildSiteDailySeriesMap(measurements, pollutant);

  const siteNameById = new Map<string, string>();
  selectedSites.forEach(site => {
    siteNameById.set(site._id, getSiteDisplayName(site));
  });

  const allDays = Array.from(
    new Set([
      ...fleetSeries.map(point => point.date),
      ...Array.from(siteSeries.values()).flatMap(series =>
        series.map(point => point.date)
      ),
    ])
  ).sort();

  const siteSeriesByDay = new Map<string, Map<string, number>>();
  siteSeries.forEach((series, siteId) => {
    const byDay = new Map<string, number>();
    series.forEach(point => byDay.set(point.date, point.value as number));
    siteSeriesByDay.set(siteId, byDay);
  });
  const fleetByDay = new Map<string, number>();
  fleetSeries.forEach(point => {
    if (point.value !== null) fleetByDay.set(point.date, point.value);
  });

  const chartData: NormalizedChartData[] = [];
  const seriesNames: string[] = [];

  siteSeriesByDay.forEach((byDay, siteId) => {
    const siteName = siteNameById.get(siteId) ?? `Site ${siteId.slice(-4)}`;
    seriesNames.push(siteName);
    allDays.forEach(day => {
      chartData.push({
        time: day,
        value: byDay.get(day) as number,
        site: siteName,
        site_id: siteId,
        device_id: '',
      });
    });
  });

  if (fleetSeries.length > 0) {
    seriesNames.push(FLEET_SERIES_KEY);
    allDays.forEach(day => {
      chartData.push({
        time: day,
        value: fleetByDay.get(day) as number,
        site: FLEET_SERIES_KEY,
        site_id: '',
        device_id: '',
      });
    });
  }

  return { chartData, seriesNames };
};

/**
 * Fleet historical trend — one line per saved location plus the fleet
 * average, backed by GET /devices/measurements/cohorts/{id}/historical.
 */
export const TrendSection: React.FC<TrendSectionProps> = ({
  cohortId,
  selectedSites,
  pollutant,
  onPollutantChange,
  aqiConfig = null,
  enabled = true,
  className,
}) => {
  const [period, setPeriod] = React.useState<TrendPeriod>('7D');

  const { measurements, isLoading, isRefreshing, error, refetch } =
    useCohortHistoricalMeasurements({
      cohortId,
      days: PERIOD_DAYS[period] ?? 7,
      frequency: 'daily',
      pollutant,
      enabled: enabled && !!cohortId,
    });

  const { chartData, seriesNames } = React.useMemo(
    () => buildSeriesData(measurements, pollutant, selectedSites),
    [measurements, pollutant, selectedSites]
  );

  const latestAverage = React.useMemo(() => {
    const fleetSeries = buildFleetDailySeries(measurements, pollutant);
    if (fleetSeries.length === 0) return null;
    const last = fleetSeries[fleetSeries.length - 1];
    return last.value;
  }, [measurements, pollutant]);

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-0">
        <ChartContainer
          title="Air Pollution Trends"
          subtitle={
            latestAverage !== null
              ? `Fleet average ${getPollutantLabel(pollutant)}: ${latestAverage.toFixed(1)} µg/m³ for the selected period`
              : `${getPollutantLabel(pollutant)} levels over time`
          }
          exportOptions={{
            enablePDF: true,
            enablePNG: true,
            filename: 'organization-air-pollution-trends',
          }}
          periodPresets={PERIOD_OPTIONS}
          activePeriod={period}
          onPeriodChange={value => setPeriod(value as TrendPeriod)}
          onRefresh={refetch}
          loading={isLoading || isRefreshing}
          error={error}
          toolbar={
            <SegmentedTabs
              ariaLabel="Pollutant"
              size="sm"
              options={POLLUTANT_OPTIONS}
              value={pollutant}
              onChange={value => onPollutantChange?.(value as PollutantType)}
            />
          }
          footerHint={`Showing ${period} of daily averages across ${Math.max(seriesNames.length - (fleetSeriesExists(seriesNames) ? 1 : 0), 0)} monitored location${Math.max(seriesNames.length - (fleetSeriesExists(seriesNames) ? 1 : 0), 0) === 1 ? '' : 's'}.`}
        >
          {!isLoading && !error && chartData.length === 0 ? (
            <EmptyState
              compact
              title="No historical measurements"
              description="There is no measurement data for the selected period yet. Try a different period or check back later."
            />
          ) : (
            <DynamicChart
              data={chartData}
              config={{
                type: 'line',
                showGrid: true,
                showTooltip: true,
                showLegend: true,
                height: 400,
              }}
              pollutant={pollutant}
              aqiConfig={aqiConfig}
              frequency="daily"
              autoSelectType={false}
              referenceLinePeriod="24hr"
            />
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const fleetSeriesExists = (seriesNames: string[]): boolean =>
  seriesNames.includes(FLEET_SERIES_KEY);
