'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChartPanScale } from '../components/ui/PanScaleReporter';
import type { ZoomRange } from './useChartZoom';

interface UseChartPanOptions {
  /** Zoom controls visible at all (gate for the wheel listener) */
  enabled: boolean;
  /** A zoom window is active (panning only makes sense while zoomed) */
  isZoomed: boolean;
  /** Shift the window by index delta (negative = earlier data) */
  pan: (deltaIndices: number) => void;
}

interface UseChartPanReturn {
  /** Attach to the chart wrapper div (relative positioned) */
  wrapperRef: React.RefObject<HTMLDivElement>;
  /** Feed to `<PanScaleReporter firstXValue lastXValue visibleCount reporterRef={...} />` */
  panScaleRef: React.MutableRefObject<ChartPanScale | null>;
  /** True while a drag-pan is in progress (cursor feedback) */
  isPanning: boolean;
  /** Pointer handlers for the wrapper div */
  pointerHandlers: {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
  };
}

/**
 * Plot-level panning: pointer-drag on the chart area and horizontal wheel
 * (or shift+wheel) shift the zoom window along the x-axis. Pixel deltas are
 * converted to exact index deltas via the reporter's px-per-index mapping,
 * and every shift is clamped by `useChartZoom.pan`.
 *
 * The wheel listener is attached natively with `passive: false` so it can
 * preventDefault — React's synthetic wheel is passive at the root and cannot.
 * Plain vertical wheel without shift is left alone (page scroll wins).
 */
export const useChartPan = ({
  enabled,
  isZoomed,
  pan,
}: UseChartPanOptions): UseChartPanReturn => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panScaleRef = useRef<ChartPanScale | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  const dragRef = useRef<{
    pointerId: number;
    pxPerIndex: number;
    startX: number;
    lastIndex: number;
  } | null>(null);

  const stateRef = useRef({ isZoomed, pan });
  stateRef.current = { isZoomed, pan };

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!stateRef.current.isZoomed || panScaleRef.current === null) return;
      // Ignore presses that land on buttons or the scrubber.
      const target = event.target as HTMLElement;
      if (target.closest('button, [role="slider"]')) return;
      const pxPerIndex = panScaleRef.current.pxPerIndex;
      if (pxPerIndex <= 0) return;
      dragRef.current = {
        pointerId: event.pointerId,
        pxPerIndex,
        startX: event.clientX,
        lastIndex: 0,
      };
      setIsPanning(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    []
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const targetIndex = Math.round(
        (event.clientX - drag.startX) / drag.pxPerIndex
      );
      const delta = targetIndex - drag.lastIndex;
      if (delta !== 0) {
        drag.lastIndex = targetIndex;
        stateRef.current.pan(delta);
      }
    },
    []
  );

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsPanning(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !enabled) return;

    const onWheel = (event: WheelEvent) => {
      if (!stateRef.current.isZoomed) return;
      // Horizontal intent only: trackpad deltaX, or shift+wheel (desktop mice).
      if (event.deltaX === 0 && !event.shiftKey) return;
      const scale = panScaleRef.current;
      if (!scale || scale.pxPerIndex <= 0) return;
      event.preventDefault();
      let delta = event.deltaX !== 0 ? event.deltaX : event.deltaY;
      if (event.deltaMode === 1)
        delta *= 16; // lines
      else if (event.deltaMode === 2) delta *= window.innerHeight; // pages
      stateRef.current.pan(Math.round(delta / scale.pxPerIndex));
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [enabled]);

  return {
    wrapperRef,
    panScaleRef,
    isPanning,
    pointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
};

export type { ZoomRange };
