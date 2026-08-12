'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import type { AqiConfig } from '@/shared/types/aqi';

interface AqiLegendProps {
  aqiConfig?: AqiConfig | null;
  /** Compact mode: bar + level names only (no numeric ranges) */
  compact?: boolean;
  className?: string;
}

const formatRange = (min: number | null, max: number | null): string => {
  if (min === null) return '—';
  if (max === null) return `${formatBoundary(min)}+`;
  return `${formatBoundary(min)}–${formatBoundary(max)}`;
};

const formatBoundary = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

/**
 * Segmented AQI scale legend rendered from the live AQI ranges config
 * (`/devices/aqi-ranges`) — the same single source of truth used for badges,
 * chart tooltips and site cards, so colors always mean the same thing.
 * Always visible (no collapse), centered, and wraps gracefully on small
 * screens.
 */
export const AqiLegend: React.FC<AqiLegendProps> = ({
  aqiConfig,
  compact = false,
  className,
}) => {
  const ranges = aqiConfig?.ranges
    ? [...aqiConfig.ranges].sort((a, b) => a.display_order - b.display_order)
    : [];

  return (
    <div className={cn('flex justify-center', className)}>
      <div className="flex w-full max-w-3xl flex-wrap justify-center overflow-hidden rounded-md border border-border">
        {ranges.length === 0 ? (
          <div className="flex h-9 flex-1 items-center justify-center bg-gray-100 dark:bg-gray-800 px-3 text-xs text-muted-foreground">
            AQI scale unavailable
          </div>
        ) : (
          ranges.map(range => (
            <div
              key={range.key}
              className={cn(
                'flex min-w-[96px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-center',
                compact && 'min-w-[72px] py-1'
              )}
              style={{ backgroundColor: range.color }}
              title={`${range.label} (${formatRange(range.min_value, range.max_value)})`}
            >
              <span
                className={cn(
                  'font-semibold leading-tight text-white',
                  compact ? 'text-[10px]' : 'text-[11px]'
                )}
              >
                {range.label}
              </span>
              {!compact && (
                <span className="text-[9px] leading-tight text-white/90">
                  {formatRange(range.min_value, range.max_value)}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AqiLegend;
