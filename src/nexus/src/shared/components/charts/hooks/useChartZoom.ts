'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ZOOM_CONFIG } from '../constants';

/** Visible window into an ordered dataset, expressed as data indices. */
export interface ZoomRange {
  startIndex: number;
  endIndex: number;
}

/**
 * Cheap content signature of a dataset: length + first/last x values. Used to
 * detect a real data change (refresh, new upload, chart-type pivot) without
 * depending on array identity — parents that rebuild the array on every
 * render must not silently drop the user's zoom window.
 */
const getDataSignature = (
  data: readonly Record<string, unknown>[],
  xKey: string
): string => {
  if (data.length === 0) return '0';
  const first = String(data[0]?.[xKey] ?? '');
  const last = String(data[data.length - 1]?.[xKey] ?? '');
  return `${data.length}:${first}:${last}`;
};

/**
 * Index-window zoom for dense charts. `null` = full dataset.
 *
 * Zooming keeps the window centered on the current window's middle; zooming
 * out grows back toward the full range. The window is expressed in data
 * indices so consumers can slice the rendered array — the chart only renders
 * the visible points, which also lightens heavy datasets.
 *
 * A stale window (dataset shrank, or the data's content actually changed)
 * silently degrades to the full view instead of pointing at different rows.
 */
export const useChartZoom = (
  data: readonly Record<string, unknown>[],
  xKey: string
) => {
  const totalPoints = data.length;
  const [zoomRange, setZoomRange] = useState<ZoomRange | null>(null);

  // New data (refresh / new upload / chart-type pivot) must never keep the
  // previous window pointing at different rows — snap back to full view.
  const signature = getDataSignature(data, xKey);
  useEffect(() => {
    setZoomRange(null);
  }, [signature]);

  // A stale window (dataset shrank in place) degrades to the full view
  // instead of rendering an empty slice.
  useEffect(() => {
    if (
      zoomRange &&
      (zoomRange.startIndex < 0 ||
        zoomRange.endIndex >= totalPoints ||
        zoomRange.startIndex > zoomRange.endIndex)
    ) {
      setZoomRange(null);
    }
  }, [zoomRange, totalPoints]);

  const isZoomed = zoomRange !== null;

  const zoomIn = useCallback(() => {
    setZoomRange(prev => {
      const start = prev?.startIndex ?? 0;
      const end = prev?.endIndex ?? totalPoints - 1;
      const span = end - start + 1;
      if (span <= ZOOM_CONFIG.minPoints) return prev;
      const nextSpan = Math.max(
        ZOOM_CONFIG.minPoints,
        Math.floor(span * ZOOM_CONFIG.step)
      );
      const center = start + (span - 1) / 2;
      let nextStart = Math.round(center - (nextSpan - 1) / 2);
      nextStart = Math.max(0, Math.min(nextStart, totalPoints - nextSpan));
      return { startIndex: nextStart, endIndex: nextStart + nextSpan - 1 };
    });
  }, [totalPoints]);

  const zoomOut = useCallback(() => {
    setZoomRange(prev => {
      if (!prev) return prev;
      const { startIndex: start, endIndex: end } = prev;
      const span = end - start + 1;
      const nextSpan = Math.min(totalPoints, span * 2);
      if (nextSpan >= totalPoints) return null;
      const center = start + (span - 1) / 2;
      let nextStart = Math.round(center - (nextSpan - 1) / 2);
      nextStart = Math.max(0, Math.min(nextStart, totalPoints - nextSpan));
      return { startIndex: nextStart, endIndex: nextStart + nextSpan - 1 };
    });
  }, [totalPoints]);

  const reset = useCallback(() => setZoomRange(null), []);

  const canZoomIn = useMemo(() => {
    const span = zoomRange
      ? zoomRange.endIndex - zoomRange.startIndex + 1
      : totalPoints;
    return span > ZOOM_CONFIG.minPoints;
  }, [zoomRange, totalPoints]);

  const canZoomOut = isZoomed;

  return {
    zoomRange,
    isZoomed,
    canZoomIn,
    canZoomOut,
    zoomIn,
    zoomOut,
    reset,
  };
};
