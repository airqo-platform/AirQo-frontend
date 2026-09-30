'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { AqArrowRight } from '@airqo/icons-react';

export interface ForecastToggleProps {
  /** Forecast data exists for this chart (PM₂.₅ + at least one location). */
  usable: boolean;
  /** The selected chart type has a time axis, so the overlay can be drawn. */
  supported: boolean;
  /** The user's persisted forecast preference for this chart. */
  enabled: boolean;
  onToggle: () => void;
  /** Sends the chart to a time-series type (the one-click escape hatch). */
  onSwitchToTimeSeries: () => void;
}

const UNSUPPORTED_HINT =
  'Forecast projects the last observed day forward in time, so it needs a time axis. Switch to a line, area, bar or scatter chart to see it.';

/**
 * Forecast control for the chart toolbar.
 *
 * Three states, so the control is never a dead switch:
 *  1. unusable  — no forecast data for this chart (e.g. PM₁₀) → plain hint.
 *  2. usable but unsupported chart type (pie/radar) → the switch is rendered
 *     visibly disabled with the reason attached, plus a one-click jump to a
 *     line chart, so the user's intent is guided rather than dropped.
 *  3. usable and supported → the normal interactive switch.
 *
 * In state 2 the persisted `enabled` preference is deliberately left untouched:
 * switching back to a time-series chart restores the projection.
 */
const ForecastToggle: React.FC<ForecastToggleProps> = ({
  usable,
  supported,
  enabled,
  onToggle,
  onSwitchToTimeSeries,
}) => {
  if (!usable) {
    return (
      <span className="text-xs text-muted-foreground">
        Forecast is available for PM₂.₅ charts
      </span>
    );
  }

  if (!supported) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
          title={UNSUPPORTED_HINT}
        >
          Forecast
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Forecast (unavailable for this chart type)"
            aria-disabled="true"
            // Inert: a control announced as disabled must not act. The chart
            // type changes only through the explicit "Use line chart" action
            // below, so pointer and keyboard behave the same.
            className={cn(
              'relative h-5 w-9 cursor-not-allowed rounded-full bg-muted opacity-60 transition-opacity motion-reduce:transition-none',
              enabled && 'bg-primary'
            )}
          >
            <span
              className={cn(
                'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform motion-reduce:transition-none',
                enabled && 'translate-x-4'
              )}
            />
          </button>
        </span>

        <button
          type="button"
          onClick={onSwitchToTimeSeries}
          title={UNSUPPORTED_HINT}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          Use line chart
          <AqArrowRight className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-foreground">
      Forecast
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Forecast"
        onClick={onToggle}
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors duration-200 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          enabled ? 'bg-primary' : 'bg-muted'
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 motion-reduce:transition-none',
            enabled && 'translate-x-4'
          )}
        />
      </button>
    </label>
  );
};

export { UNSUPPORTED_HINT };
export default ForecastToggle;
