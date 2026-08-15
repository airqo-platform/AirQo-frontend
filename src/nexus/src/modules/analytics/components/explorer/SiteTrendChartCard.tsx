'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { DynamicChart } from '@/shared/components/charts';
import { ChartContainer } from '@/shared/components/charts';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { getDefaultSiteColor } from '../../utils/siteColors';
import {
  useSiteTrendData,
  TREND_PERIOD_PRESETS,
  type TrendPeriod,
} from '../../hooks/useSiteTrendData';
import { formatReadingTime } from '../../utils/siteDetails';
import type { PollutantType } from '@/shared/components/charts/types';

interface SiteTrendChartCardProps {
  siteId: string;
  siteName?: string;
  className?: string;
}

const POLLUTANT_OPTIONS: { value: PollutantType; label: string }[] = [
  { value: 'pm2_5', label: 'PM2.5' },
  { value: 'pm10', label: 'PM10' },
];

const PERIOD_OPTIONS: { value: TrendPeriod; label: string }[] =
  TREND_PERIOD_PRESETS.map(p => ({ value: p.value, label: p.label }));

/**
 * Historical trend for a single location — reuses ChartContainer for
 * consistent loading states, export, and toolbar chrome. The pollutant
 * selector and period toggle are injected via the toolbar/periodPresets
 * props. Series color uses the theme-aware palette (same as AnalyticsChartCard).
 */
export const SiteTrendChartCard: React.FC<SiteTrendChartCardProps> = ({
  siteId,
  siteName,
  className,
}) => {
  const [period, setPeriod] = useState<TrendPeriod>('7D');
  const [pollutant, setPollutant] = useState<PollutantType>('pm2_5');
  const { config: aqiConfig } = useAqiConfig(pollutant);

  const { chartData, isLoading, error, hasData } = useSiteTrendData({
    siteId,
    period,
    pollutant,
  });

  const lastUpdated = useMemo(() => {
    if (chartData.length === 0) return null;
    const times = chartData
      .map(point => String(point.time ?? ''))
      .filter(Boolean)
      .sort();
    return times[times.length - 1] ?? null;
  }, [chartData]);

  // Theme-aware color — first palette shade (matches the app's primary)
  const seriesColor = useMemo(() => getDefaultSiteColor(0), []);

  return (
    <ChartContainer
      title="Air Quality Trend"
      subtitle={siteName ?? undefined}
      loading={isLoading}
      error={error ?? null}
      exportOptions={{
        enablePDF: true,
        enablePNG: true,
        filename: `air-quality-trend-${siteId}`,
      }}
      periodPresets={PERIOD_OPTIONS}
      activePeriod={period}
      onPeriodChange={value => setPeriod(value as TrendPeriod)}
      className={cn('w-full', className)}
      toolbar={
        <SegmentedTabs
          ariaLabel="Pollutant"
          size="sm"
          options={POLLUTANT_OPTIONS}
          value={pollutant}
          onChange={value => setPollutant(value as PollutantType)}
        />
      }
      footerHint={
        lastUpdated ? (
          <span className="block truncate text-xs text-muted-foreground">
            Last data point: {formatReadingTime(lastUpdated)} ·{' '}
            {chartData.length} points
          </span>
        ) : undefined
      }
    >
      {hasData ? (
        <DynamicChart
          data={chartData}
          config={{
            type: 'area',
            showGrid: true,
            showTooltip: true,
            showLegend: false,
            height: 380,
            color: seriesColor,
          }}
          pollutant={pollutant}
          aqiConfig={aqiConfig}
          frequency="daily"
          autoSelectType={false}
          referenceLinePeriod="24hr"
        />
      ) : (
        !isLoading && (
          <div className="flex h-[380px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No trend data available for this period.
            </p>
          </div>
        )
      )}
    </ChartContainer>
  );
};

export default SiteTrendChartCard;
