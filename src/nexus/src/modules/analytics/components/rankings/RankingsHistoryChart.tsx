'use client';

import React, { useMemo } from 'react';
import { ChartContainer } from '@/shared/components/charts';
import { DynamicChart } from '@/shared/components/charts';
import type { AqiConfig } from '@/shared/types/aqi';
import type { RankingHistoryEntry } from '@/shared/types/api';
import type { NormalizedChartData } from '@/shared/components/charts/types';
import { buildHistoryChartData } from '../../utils/rankings';

interface RankingsHistoryChartProps {
  history: RankingHistoryEntry[];
  aqiConfig?: AqiConfig | null;
  isLoading?: boolean;
  className?: string;
}

/**
 * Bar chart of average PM2.5 per year for the top entities in the historical
 * comparison. Reuses the shared chart components (ChartContainer +
 * DynamicChart) so tooltips, legends, export and theming stay consistent.
 */
export const RankingsHistoryChart: React.FC<RankingsHistoryChartProps> = ({
  history,
  aqiConfig,
  isLoading = false,
  className,
}) => {
  const chartData = useMemo<NormalizedChartData[]>(
    () => buildHistoryChartData(history, 10),
    [history]
  );

  return (
    <ChartContainer
      title="PM2.5 trends by year"
      subtitle="Average PM2.5 (µg/m³) per year for the top ranked locations"
      exportOptions={{
        enablePDF: true,
        enablePNG: true,
        filename: 'air-quality-rankings-history',
      }}
      loading={isLoading}
      className={className}
    >
      <DynamicChart
        data={chartData}
        config={{
          type: 'bar',
          showGrid: true,
          showTooltip: true,
          showLegend: true,
          height: 360,
          // The x values are year labels ("2024"), not ISO timestamps — the
          // default frequency formatter would render every tick as
          // "Jan 01". Pass them through untouched on the axis and in the
          // tooltip.
          xAxisTickFormatter: value => value,
          tooltipDateFormatter: label => String(label),
        }}
        pollutant="pm2_5"
        aqiConfig={aqiConfig ?? null}
        autoSelectType={false}
      />
    </ChartContainer>
  );
};

export default RankingsHistoryChart;
