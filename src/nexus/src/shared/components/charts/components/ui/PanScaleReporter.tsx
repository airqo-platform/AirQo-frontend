'use client';

import React from 'react';
import { useXAxisScale } from 'recharts';

export interface ChartPanScale {
  /** Pixel width of one data index within the visible window */
  pxPerIndex: number;
}

/**
 * Bridges recharts' exact x-axis scale to the chart wrapper's pan handlers.
 *
 * Rendered via `<Customized>` inside the chart, it evaluates the real axis
 * scale (recharts 3 `useXAxisScale`) at the first and last rendered x values
 * — both are inside the axis domain by construction — and derives the exact
 * pixel width of one data index. That mapping is written into a ref the
 * wrapper's drag/wheel handlers consume.
 */
export const PanScaleReporter: React.FC<{
  firstXValue: unknown;
  lastXValue: unknown;
  visibleCount: number;
  reporterRef: React.MutableRefObject<ChartPanScale | null>;
}> = ({ firstXValue, lastXValue, visibleCount, reporterRef }) => {
  const scale = useXAxisScale();

  const pxPerIndex = React.useMemo(() => {
    if (!scale || visibleCount <= 1) return 0;
    const firstPx = scale(firstXValue);
    const lastPx = scale(lastXValue);
    if (
      typeof firstPx !== 'number' ||
      typeof lastPx !== 'number' ||
      !Number.isFinite(firstPx) ||
      !Number.isFinite(lastPx)
    ) {
      return 0;
    }
    return Math.abs(lastPx - firstPx) / (visibleCount - 1);
  }, [firstXValue, lastXValue, scale, visibleCount]);

  React.useEffect(() => {
    if (pxPerIndex > 0) {
      reporterRef.current = { pxPerIndex };
    }
  }, [pxPerIndex, reporterRef]);

  return null;
};
