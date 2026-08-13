'use client';

import React, { useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import {
  getPollutantLabel,
  EPA_AQI_CATEGORIES,
} from '@/shared/utils/airQuality';
import { AqInfoCircle } from '@airqo/icons-react';
import { Tooltip } from 'flowbite-react';
import type { PollutantType } from '@/shared/components/charts/types';
import type { AqiConfig } from '@/shared/types/aqi';
import { Card, CardContent } from '@/shared/components/ui/card';

interface AirQualityReferenceLegendProps {
  pollutant: PollutantType;
  /** e.g. "24-hour" — matches the chart's comparison basis */
  averagingPeriod?: string;
  className?: string;
}

const formatConcBoundary = (value: number | null, decimal: boolean): string => {
  if (value === null) return '—';
  return decimal ? value.toFixed(1) : String(value);
};

const formatConcRange = (
  min: number,
  max: number | null,
  decimal: boolean
): string => {
  if (max === null) return `${formatConcBoundary(min, decimal)}+ μg/m³`;
  return `${formatConcBoundary(min, decimal)} – ${formatConcBoundary(max, decimal)} μg/m³`;
};

const formatAqiRange = (min: number, max: number | null): string => {
  if (max === null) return `${min}+`;
  return `${min}–${max}`;
};

/** Category colors come from the live aqi-ranges config (badge/tooltip parity). */
const colorForCategory = (
  config: AqiConfig | null,
  key: string
): string | undefined => {
  if (!config) return undefined;
  const range = [...config.ranges].find(item => item.key === key);
  return range?.color ?? undefined;
};

const FALLBACK_COLORS: Record<string, string> = {
  good: '#10B981',
  moderate: '#F59E0B',
  u4sg: '#EF4444',
  unhealthy: '#8B5CF6',
  very_unhealthy: '#DC2626',
  hazardous: '#7C2D12',
};

/**
 * Vertical reference legend for the active chart: one row per US EPA AQI
 * category with a slim color stripe, the canonical EPA concentration band and
 * its AQI index range. Adapts to the selected pollutant.
 *
 * The categories are the authoritative EPA breakpoint table (24-hour), kept
 * separate from the chart's own reference standard (WHO/NEMA), which is
 * configured independently in the chart toolbar.
 */
export const AirQualityReferenceLegend: React.FC<
  AirQualityReferenceLegendProps
> = ({ pollutant, averagingPeriod = '24-hour', className }) => {
  const { config: aqiConfig } = useAqiConfig(pollutant);

  const categories = useMemo(() => {
    const table = EPA_AQI_CATEGORIES[pollutant];
    if (!table) return [];
    const decimal = pollutant === 'pm2_5';
    return table.map(category => ({
      ...category,
      color:
        colorForCategory(aqiConfig, category.key) ??
        FALLBACK_COLORS[category.key] ??
        '#6B7280',
      concLabel: formatConcRange(category.concMin, category.concMax, decimal),
      aqiLabel: formatAqiRange(category.aqiMin, category.aqiMax),
    }));
  }, [aqiConfig, pollutant]);

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              {getPollutantLabel(pollutant)} {averagingPeriod} concentration
              scale
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              US EPA AQI classification
            </p>
          </div>
          <Tooltip
            content={
              <p className="max-w-[220px] text-left text-xs text-gray-200">
                Category boundaries follow the US EPA Air Quality Index. The
                chart&apos;s reference guideline is configured independently
                via the Reference standard selector.
              </p>
            }
            placement="top"
          >
            <span className="inline-flex cursor-help">
              <AqInfoCircle className="h-4 w-4 text-muted-foreground" />
            </span>
          </Tooltip>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-md bg-muted/50 px-3 py-4 text-center text-xs text-muted-foreground">
            AQI scale unavailable
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {categories.map(category => (
              <li key={category.key} className="flex items-center gap-3 py-1.5">
                <span
                  aria-hidden="true"
                  className="h-7 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="min-w-0 flex-1 text-[13px] font-medium text-foreground">
                  {category.label}
                </span>
                <span className="shrink-0 text-right text-xs">
                  <span className="block font-medium tabular-nums text-foreground">
                    {category.concLabel}
                  </span>
                  <span className="block tabular-nums text-muted-foreground">
                    AQI {category.aqiLabel}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default AirQualityReferenceLegend;
