'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { ChartContainer, DynamicChart } from '@/shared/components/charts';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import { DatePicker } from '@/shared/components/ui';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useAnalyticsChartData } from '@/modules/analytics';
import { getGuidelinePeriod } from '@/modules/analytics/utils/chartConfig';
import { getPollutantLabel } from '@/shared/utils/airQuality';
import type { AqiConfig } from '@/shared/types/aqi';
import type { Site } from '@/shared/types/api';
import { getSiteDisplayName } from '@/shared/utils/siteUtils';
import type { ChartType } from '@/shared/components/charts/types';
import {
  FLEET_AVERAGE_SERIES_KEY,
  buildFleetAverageSeries,
} from '../utils/measurements';
import type { PollutantType } from '../types';

interface TrendSectionProps {
  siteIds: string[];
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

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
  { value: 'bar', label: 'Bar' },
];

const toDateInput = (date: Date): string => format(date, 'yyyy-MM-dd');

/**
 * Fleet historical trend for any user-selected date range (DatePicker),
 * powered by the aggregated D3 chart service — the same service the
 * favorites module uses to visualize saved locations
 * (POST /analytics/dashboard/chart/d3/data), so any range resolves in a
 * single server-side aggregated request. One series per reporting location
 * plus the fleet average; the user picks line / area / bar.
 */
export const TrendSection: React.FC<TrendSectionProps> = ({
  siteIds,
  selectedSites,
  pollutant,
  onPollutantChange,
  aqiConfig = null,
  enabled = true,
  className,
}) => {
  const [dateRange, setDateRange] = React.useState<{
    from: Date;
    to: Date;
  }>(() => {
    const to = new Date();
    const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from, to };
  });
  const [chartType, setChartType] = React.useState<ChartType>('bar');

  const startDate = React.useMemo(
    () => toDateInput(dateRange.from),
    [dateRange.from]
  );
  const endDate = React.useMemo(
    () => toDateInput(dateRange.to),
    [dateRange.to]
  );

  // The chart endpoint accepts line/bar only — area renders client-side
  // from the line series.
  const requestChartType = chartType === 'bar' ? 'bar' : 'line';

  const { chartData, isLoading, isRefreshing, error, refetch } =
    useAnalyticsChartData(
      {
        frequency: 'daily',
        startDate,
        endDate,
        pollutant,
      },
      requestChartType,
      siteIds,
      enabled && siteIds.length > 0
    );

  const fleetSeries = React.useMemo(
    () => buildFleetAverageSeries(chartData),
    [chartData]
  );

  const chartDataWithFleet = React.useMemo(() => {
    if (fleetSeries.length === 0) return chartData;
    return [...chartData, ...fleetSeries];
  }, [chartData, fleetSeries]);

  const locationLabels = React.useMemo(() => {
    const map = new Map<string, string>();
    selectedSites.forEach(site => {
      map.set(site._id, getSiteDisplayName(site));
    });
    return Object.fromEntries(map);
  }, [selectedSites]);

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-0">
        <ChartContainer
          title="Air Pollution Trends"
          subtitle={`${getPollutantLabel(pollutant)} daily averages across locations with recent readings`}
          exportOptions={{
            enablePDF: true,
            enablePNG: true,
            filename: 'organization-air-pollution-trends',
          }}
          onRefresh={refetch}
          loading={isLoading || isRefreshing}
          error={error}
          themeColors
          currentSites={selectedSites.map(site => ({
            _id: site._id,
            name: getSiteDisplayName(site),
            search_name: getSiteDisplayName(site),
            country: site.country,
          }))}
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <DatePicker
                mode="range"
                value={dateRange}
                onChange={value => {
                  if (
                    value &&
                    typeof value === 'object' &&
                    'from' in value &&
                    value.from instanceof Date
                  ) {
                    setDateRange({
                      from: value.from,
                      to: value.to instanceof Date ? value.to : value.from,
                    });
                  }
                }}
                showPresets
                className="w-auto"
              />
              <SegmentedTabs
                ariaLabel="Chart type"
                size="sm"
                options={CHART_TYPE_OPTIONS}
                value={chartType}
                onChange={value => setChartType(value as ChartType)}
              />
              <SegmentedTabs
                ariaLabel="Pollutant"
                size="sm"
                options={POLLUTANT_OPTIONS}
                value={pollutant}
                onChange={value => onPollutantChange?.(value as PollutantType)}
              />
            </div>
          }
          footerHint={
            <span>
              {format(dateRange.from, 'MMM d, yyyy')} –{' '}
              {format(dateRange.to, 'MMM d, yyyy')} · {siteIds.length}{' '}
              {siteIds.length === 1 ? 'location' : 'locations'} with recent
              readings
            </span>
          }
        >
          <DynamicChart
            data={chartDataWithFleet}
            config={{
              type: chartType,
              showGrid: true,
              showTooltip: true,
              showLegend: true,
              height: 400,
              themeColors: true,
            }}
            pollutant={pollutant}
            aqiConfig={aqiConfig}
            frequency="daily"
            autoSelectType={false}
            // Daily averages are compared with WHO's 24-hour guideline:
            // PM2.5 = 15 µg/m³ and PM10 = 45 µg/m³.
            referenceLinePeriod={getGuidelinePeriod('daily')}
            seriesLabels={{
              [FLEET_AVERAGE_SERIES_KEY]: FLEET_AVERAGE_SERIES_KEY,
            }}
            locationLabels={locationLabels}
          />
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
