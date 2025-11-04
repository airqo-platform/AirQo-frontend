'use client';

import React from 'react';
import { DynamicChart } from '@/shared/components/charts';
import { useSiteChartData } from '@/modules/airqo-map/hooks/useSiteChartData';
import { useAnalytics } from '@/modules/analytics/hooks/useAnalytics';
import type { PollutantType } from '@/shared/components/charts/types';
import { cn } from '@/shared/lib/utils';

interface SiteInsightsChartProps {
  siteId: string;
  className?: string;
  height?: number;
  defaultPollutant?: PollutantType;
}

/**
 * Site Insights Chart Component
 * Displays area chart with air quality data for a specific site
 * Used in map sidebar location details panel
 */
export const SiteInsightsChart: React.FC<SiteInsightsChartProps> = ({
  siteId,
  className,
  height = 150,
  defaultPollutant = 'pm2_5',
}) => {
  // Get current pollutant from analytics store for consistency with map
  const { filters } = useAnalytics();
  const currentPollutant = filters?.pollutant || defaultPollutant;

  // Calculate last 7 days date range
  const dateRange = React.useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }, []);

  // Fetch chart data for the specific site
  const { chartData } = useSiteChartData({
    siteId,
    pollutant: currentPollutant,
    frequency: 'daily',
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    enabled: true,
  });

  return (
    <div className={cn('w-full', className)}>
      <DynamicChart
        data={chartData}
        config={{
          type: 'area',
          height: height,
          showGrid: true,
          showTooltip: true,
          showLegend: false, // Single site, no need for legend
          fillOpacity: 0.2,
          strokeWidth: 2,
        }}
        pollutant={currentPollutant}
        frequency="daily"
        autoSelectType={false}
        responsive={true}
      />
    </div>
  );
};
