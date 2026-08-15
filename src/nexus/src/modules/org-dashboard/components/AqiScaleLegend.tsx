'use client';

import * as React from 'react';
import type { AqiConfig } from '@/shared/types/aqi';
import { cn } from '@/shared/lib/utils';

interface AqiScaleLegendProps {
  pollutant?: string;
  aqiConfig?: AqiConfig | null;
  className?: string;
}

/**
 * Horizontal AQI scale rendered from the live aqi-ranges config — each band
 * shows its label and numeric range, colored with the config's colors.
 */
export const AqiScaleLegend: React.FC<AqiScaleLegendProps> = ({
  pollutant = 'PM2.5',
  aqiConfig = null,
  className,
}) => {
  const ranges = aqiConfig?.ranges
    ? [...aqiConfig.ranges].sort((a, b) => a.display_order - b.display_order)
    : [];

  if (ranges.length === 0) {
    return null;
  }

  return (
    <div
      className={cn('w-full space-y-2', className)}
      aria-label={`Air quality scale for ${pollutant}`}
    >
      <div className="flex overflow-hidden rounded-full border border-border">
        {ranges.map(range => (
          <div
            key={range.key}
            className="h-3 flex-1"
            style={{ backgroundColor: range.color || '#9CA3AF' }}
            title={`${range.label}: ${range.min_value} - ${
              range.max_value ?? '∞'
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {ranges.map(range => (
          <span
            key={range.key}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: range.color || '#9CA3AF' }}
            />
            {range.label}
            <span className="font-medium text-foreground/80">
              {range.min_value}
              {range.max_value !== null ? `–${range.max_value}` : '+'}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};
