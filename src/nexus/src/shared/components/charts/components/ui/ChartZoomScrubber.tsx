'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/utils';
import type { ZoomRange } from '../../hooks/useChartZoom';

interface ChartZoomScrubberProps {
  totalPoints: number;
  zoomRange: ZoomRange | null;
  onPan: (deltaIndices: number) => void;
  onPanToCenter: (centerIndex: number) => void;
  className?: string;
}

/**
 * Scrollbar-style window scrubber shown under the chart while zoomed.
 *
 * - **Drag the thumb** (or press on the track) to move the visible window.
 * - **Press anywhere on the track** to jump the window's center there.
 * - **Horizontal wheel / shift+wheel** over the scrubber pans it.
 * - **Keyboard** (focused): ← → pan by 10% of the window, Home/End jump.
 *
 * All movement is index-based and clamped upstream, so the thumb always
 * reflects the exact visible window. Excluded from PNG/PDF exports.
 */
export const ChartZoomScrubber: React.FC<ChartZoomScrubberProps> = ({
  totalPoints,
  zoomRange,
  onPan,
  onPanToCenter,
  className,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    pxPerPoint: number;
    lastIndex: number;
  } | null>(null);

  // Kept in a ref so native listeners (wheel) never capture stale callbacks.
  const handlersRef = useRef({ onPan, onPanToCenter });
  handlersRef.current = { onPan, onPanToCenter };

  const start = zoomRange?.startIndex ?? 0;
  const span = zoomRange
    ? zoomRange.endIndex - zoomRange.startIndex + 1
    : totalPoints;

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      if (!track || !zoomRange) return;
      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return;
      const pxPerPoint = rect.width / totalPoints;

      // Pressing on the thumb drags it; pressing elsewhere jumps the window
      // center to the press position and continues dragging from there.
      if (!(event.target as HTMLElement).closest('[data-scrubber-thumb]')) {
        handlersRef.current.onPanToCenter(
          ((event.clientX - rect.left) / rect.width) * totalPoints
        );
      }

      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        pxPerPoint,
        lastIndex: 0,
      };
      event.stopPropagation();
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [totalPoints, zoomRange]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const targetIndex = Math.round(
        (event.clientX - drag.startX) / drag.pxPerPoint
      );
      const delta = targetIndex - drag.lastIndex;
      if (delta !== 0) {
        drag.lastIndex = targetIndex;
        handlersRef.current.onPan(delta);
      }
    },
    []
  );

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!zoomRange) return;
      const step = Math.max(1, Math.round(span * 0.1));
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlersRef.current.onPan(-step);
          break;
        case 'ArrowRight':
          event.preventDefault();
          handlersRef.current.onPan(step);
          break;
        case 'Home':
          event.preventDefault();
          handlersRef.current.onPanToCenter(0);
          break;
        case 'End':
          event.preventDefault();
          handlersRef.current.onPanToCenter(totalPoints - 1);
          break;
        default:
          break;
      }
    },
    [span, totalPoints, zoomRange]
  );

  // Native non-passive wheel so page scroll can be prevented over the track.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      let delta = event.deltaX !== 0 ? event.deltaX : event.deltaY;
      if (delta === 0) return;
      if (event.deltaMode === 1) delta *= 16;
      else if (event.deltaMode === 2) delta *= window.innerHeight;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      event.preventDefault();
      event.stopPropagation();
      handlersRef.current.onPan(Math.round(delta / (rect.width / totalPoints)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [totalPoints]);

  if (!zoomRange) return null;

  const thumbLeft = (start / totalPoints) * 100;
  const thumbWidth = (span / totalPoints) * 100;

  return (
    <div
      className={cn('mt-1 h-4 w-full px-1 select-none', className)}
      data-export-ignore
      data-html2canvas-ignore="true"
    >
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Scroll chart window"
        aria-valuemin={0}
        aria-valuemax={Math.max(0, totalPoints - span)}
        aria-valuenow={start}
        aria-valuetext={`Viewing points ${start + 1}–${Math.min(
          totalPoints,
          start + span
        )} of ${totalPoints}`}
        className="relative h-1.5 top-1/2 -translate-y-1/2 w-full rounded-full bg-muted cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
      >
        <div
          data-scrubber-thumb
          data-testid="scrubber-thumb"
          className="absolute top-0 h-full min-w-[8px] rounded-full bg-primary/80"
          style={{ left: `${thumbLeft}%`, width: `${thumbWidth}%` }}
        />
      </div>
    </div>
  );
};
