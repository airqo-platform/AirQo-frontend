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

const formatBoundary = (value: number): string => String(value);

const buildRangeLabel = (min: number, max: number | null): string => {
  if (max === null) return `${formatBoundary(min)}+`;
  return `${formatBoundary(min)}–${formatBoundary(max)}`;
};

/**
 * Continuous AQI scale legend rendered from the live AQI ranges config
 * (`/devices/aqi-ranges`) — the same single source of truth used for badges,
 * chart tooltips and site cards, so colors always mean the same thing.
 *
 * Design: one continuous gradient bar (IQAir / AirNow pattern) with a label
 * row below — coloured dot + level name + numeric range for every band.
 * Always visible, centered, wraps gracefully on small screens.
 *
 * With `markerValue` set it doubles as a gauge: a marker sits on the bar at
 * the value's proportional position, and the value is exposed as real text
 * below it (WCAG 1.4.1 — the color never carries the information alone).
 */
export const AqiLegend: React.FC<AqiLegendProps> = ({
  aqiConfig,
  compact = false,
  markerValue,
  ariaLabel = 'Air quality index scale',
  className,
}) => {
  const ranges = React.useMemo(() => {
    if (!aqiConfig?.ranges) return [];
    return [...aqiConfig.ranges].sort(
      (a, b) => a.display_order - b.display_order
    );
  }, [aqiConfig?.ranges]);

  // Continuous bar layout: every band occupies its proportional slice of the
  // scale (first range min → open-ended band). The open-ended band gets a
  // visible extension so e.g. "Hazardous 301+" is never a zero-width sliver.
  const scale = React.useMemo(() => {
    if (ranges.length === 0) return null;

    const globalMin = ranges[0]?.min_value ?? 0;
    const openMin = ranges.find(range => range.max_value === null)?.min_value;
    const lastClosedMax =
      ranges[ranges.length - 1]?.max_value ?? openMin ?? globalMin + 1;
    const boundedSpan = (openMin ?? lastClosedMax) - globalMin;
    const extension =
      openMin != null
        ? Math.max(
            lastClosedMax - (ranges[ranges.length - 2]?.min_value ?? globalMin),
            boundedSpan * 0.1
          )
        : 0;
    const totalSpan = boundedSpan + extension;

    const segments = ranges.map(range => {
      const start = range.min_value - globalMin;
      const end = range.max_value ?? globalMin + totalSpan;
      return {
        ...range,
        startPct: (start / totalSpan) * 100,
        pct: ((end - range.min_value) / totalSpan) * 100,
      };
    });

    return { globalMin, totalSpan, segments };
  }, [ranges]);

  const markerPercent = React.useMemo(() => {
    if (!scale || markerValue == null || !Number.isFinite(markerValue)) {
      return null;
    }
    const span = scale.totalSpan;
    if (span <= 0) return null;
    const clamped = Math.min(
      Math.max(markerValue, scale.globalMin),
      scale.globalMin + span
    );
    return Math.min(
      Math.max(((clamped - scale.globalMin) / span) * 100, 2),
      98
    );
  }, [markerValue, scale]);

  if (!scale) {
    return (
      <div className={cn('flex justify-center', className)}>
        <div className="flex w-full max-w-3xl items-center justify-center rounded-md border border-border bg-gray-100 px-3 py-2 text-xs text-muted-foreground dark:bg-gray-800">
          AQI scale unavailable
        </div>
      </div>
    );
  }

  const gradient = scale.segments
    .map(
      segment =>
        `${segment.color || '#9CA3AF'} ${segment.startPct.toFixed(2)}% ${(
          segment.startPct + segment.pct
        ).toFixed(2)}%`
    )
    .join(', ');

  const activeRange =
    markerValue != null && Number.isFinite(markerValue)
      ? ranges.find(
          range =>
            markerValue >= (range.min_value ?? -Infinity) &&
            (range.max_value === null || markerValue <= range.max_value)
        )
      : undefined;

  return (
    <div className={cn('flex justify-center', className)}>
      <div className="flex w-full max-w-3xl flex-col items-center gap-3">
        <div
          role="img"
          aria-label={ariaLabel}
          className="relative h-3 w-full rounded-full"
          style={{ background: `linear-gradient(to right, ${gradient})` }}
        >
          {markerPercent !== null && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gray-900 shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
              style={{ left: `${markerPercent}%` }}
            />
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {ranges.map(range => (
            <span
              key={range.key}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: range.color || '#9CA3AF' }}
              />
              <span className="font-medium text-foreground">{range.label}</span>
              {!compact && (
                <span className="font-normal text-muted-foreground/80">
                  {buildRangeLabel(range.min_value, range.max_value)}
                </span>
              )}
            </span>
          ))}
        </div>

        {activeRange && markerValue != null && Number.isFinite(markerValue) && (
          <p className="sr-only" aria-label={ariaLabel}>
            Current value {markerValue} — {activeRange.label}
          </p>
        )}
      </div>
    </div>
  );
};

export default AqiLegend;
