'use client';

import React, { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { HiChevronDown } from 'react-icons/hi';
import type { AqiConfig } from '@/shared/types/aqi';

interface AqiLegendProps {
  aqiConfig?: AqiConfig | null;
  /** Compact mode: bar + level names only (no numeric ranges) */
  compact?: boolean;
  /** Collapsible header (IQAir-style): collapsed shows a slim strip */
  collapsible?: boolean;
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
 */
export const AqiLegend: React.FC<AqiLegendProps> = ({
  aqiConfig,
  compact = false,
  collapsible = false,
  className,
}) => {
  const [expanded, setExpanded] = useState(true);

  const ranges = aqiConfig?.ranges
    ? [...aqiConfig.ranges].sort((a, b) => a.display_order - b.display_order)
    : [];

  const bar = (
    <div
      className={cn(
        'flex w-full overflow-hidden rounded-md border border-border',
        !expanded && collapsible && 'max-h-9',
        expanded && collapsible && 'flex-col sm:flex-row'
      )}
    >
      {ranges.length === 0 ? (
        <div className="flex h-9 flex-1 items-center justify-center bg-gray-100 dark:bg-gray-800 px-3 text-xs text-muted-foreground">
          AQI scale unavailable
        </div>
      ) : (
        ranges.map(range => (
          <div
            key={range.key}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-center',
              !expanded && collapsible && 'py-1.5'
            )}
            style={{ backgroundColor: range.color }}
            title={`${range.label} (${formatRange(range.min_value, range.max_value)})`}
          >
            <span
              className={cn(
                'font-semibold leading-tight',
                compact ? 'text-[10px]' : 'text-[11px]',
                // Keep text legible over the AQI band colors (IQAir keeps
                // dark text on light bands; our config colors are mid-tone,
                // so white works across them).
                'text-white'
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
  );

  if (!collapsible) {
    return <div className={className}>{bar}</div>;
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        AQI legend
        <HiChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            expanded && 'rotate-180'
          )}
        />
      </button>
      {bar}
    </div>
  );
};

export default AqiLegend;
