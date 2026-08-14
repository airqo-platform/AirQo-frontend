'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import type { AqiConfig } from '@/shared/types/aqi';

interface AqiLegendProps {
  aqiConfig?: AqiConfig | null;
  /** Compact mode: bar + level names only (no numeric ranges) */
  compact?: boolean;
  /** When set, renders a gauge marker at this value's position on the bar */
  markerValue?: number | null;
  /** Accessible label for the bar (defaults to "Air quality index scale") */
  ariaLabel?: string;
  className?: string;
}

const formatRange = (min: number | null, max: number | null): string => {
  if (min === null) return '—';
  if (max === null) return `${formatBoundary(min)}+`;
  return `${formatBoundary(min)}–${formatBoundary(max)}`;
};

const formatBoundary = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const markerPositionForValue = (
  value: number,
  range: { min_value: number | null; max_value: number | null }
): number => {
  const min = range.min_value ?? 0;
  const max = range.max_value ?? min + 1;
  const span = max - min;
  if (span <= 0) return 50;
  const clamped = Math.min(Math.max(value, min), max);
  return (clamped - min) / span;
};

/**
 * Keep the 6px marker fully inside its segment: 5% at the low end, 95% at
 * the high end (values at a segment's max would otherwise bleed into the
 * neighbor / be clipped by the container's overflow-hidden).
 */
const clampMarkerPercent = (percent: number): number =>
  Math.min(Math.max(percent, 5), 95);

/**
 * Segmented AQI scale legend rendered from the live AQI ranges config
 * (`/devices/aqi-ranges`) — the same single source of truth used for badges,
 * chart tooltips and site cards, so colors always mean the same thing.
 * Always visible (no collapse), centered, and wraps gracefully on small
 * screens.
 *
 * With `markerValue` set it doubles as a gauge: a marker sits on the segment
 * containing the value, and the value is exposed as real text below it
 * (WCAG 1.4.1 — the color never carries the information alone).
 */
export const AqiLegend: React.FC<AqiLegendProps> = ({
  aqiConfig,
  compact = false,
  markerValue,
  ariaLabel = 'Air quality index scale',
  className,
}) => {
  const ranges = aqiConfig?.ranges
    ? [...aqiConfig.ranges].sort((a, b) => a.display_order - b.display_order)
    : [];

  const activeRange =
    markerValue != null && Number.isFinite(markerValue)
      ? ranges.find(
          range =>
            markerValue >= (range.min_value ?? -Infinity) &&
            (range.max_value === null || markerValue <= range.max_value)
        )
      : undefined;

  const markerPercent =
    markerValue != null &&
    Number.isFinite(markerValue) &&
    activeRange &&
    activeRange.min_value != null
      ? clampMarkerPercent(markerPositionForValue(markerValue, activeRange) * 100)
      : null;

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
              role="img"
              aria-label={`${range.label}: ${formatRange(range.min_value, range.max_value)}`}
              className={cn(
                'relative flex min-w-[96px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-center',
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
              {/* Gauge marker: white dot on the active segment */}
              {activeRange?.key === range.key && markerPercent !== null && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0.5 top-0.5 w-1.5 rounded-full bg-white shadow-[0_0_0_2px_rgba(0,0,0,0.35)]"
                  style={{
                    left: `calc(${markerPercent}% - 3px)`,
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
      {markerValue != null && Number.isFinite(markerValue) && (
        <p className="sr-only" aria-label={ariaLabel}>
          Current value {markerValue} —{' '}
          {activeRange?.label ?? 'outside the configured scale'}
        </p>
      )}
    </div>
  );
};

export default AqiLegend;
