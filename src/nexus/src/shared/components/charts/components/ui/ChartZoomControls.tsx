'use client';

import React from 'react';
import { AqZoomIn, AqZoomOut, AqExpand } from '@airqo/icons-react';
import { cn } from '@/shared/lib/utils';

interface ChartZoomControlsProps {
  canZoomIn: boolean;
  canZoomOut: boolean;
  isZoomed: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  className?: string;
}

/**
 * Floating zoom control pill pinned to the top-right of the chart plot.
 *
 * Hidden by default; revealed when the owning chart wrapper is hovered
 * (`group` class on the wrapper) or when one of its buttons receives
 * keyboard focus. On coarse-pointer (touch) devices it stays visible since
 * there is no hover state. Marked `data-export-ignore` (shared chart
 * export) and `data-html2canvas-ignore` (data-visualizer export) so
 * exported PNG/PDF images never include the controls.
 */
export const ChartZoomControls: React.FC<ChartZoomControlsProps> = ({
  canZoomIn,
  canZoomOut,
  isZoomed,
  onZoomIn,
  onZoomOut,
  onReset,
  className,
}) => (
  <div
    role="group"
    aria-label="Chart zoom controls"
    title="Zoom into the data window"
    data-export-ignore
    data-html2canvas-ignore="true"
    className={cn(
      'absolute top-2 right-2 z-20 flex items-center gap-0.5 rounded-lg border border-border bg-background/90 p-0.5 shadow-sm backdrop-blur-sm',
      'opacity-0 pointer-events-none transition-opacity duration-150',
      'group-hover:opacity-100 group-hover:pointer-events-auto',
      'group-focus-within:opacity-100 group-focus-within:pointer-events-auto',
      'pointer-coarse:opacity-100 pointer-coarse:pointer-events-auto',
      className
    )}
  >
    <button
      type="button"
      onClick={onZoomIn}
      disabled={!canZoomIn}
      title="Zoom in — show fewer, more detailed points"
      aria-label="Zoom in"
      className="flex items-center justify-center p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:bg-transparent"
    >
      <AqZoomIn className="h-4 w-4" />
    </button>
    <button
      type="button"
      onClick={onZoomOut}
      disabled={!canZoomOut}
      title="Zoom out — show a wider time range"
      aria-label="Zoom out"
      className="flex items-center justify-center p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:bg-transparent"
    >
      <AqZoomOut className="h-4 w-4" />
    </button>
    {isZoomed && (
      <button
        type="button"
        onClick={onReset}
        title="Reset zoom — show the full data range again"
        aria-label="Reset zoom"
        className="flex items-center gap-1 pl-1.5 pr-2 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <AqExpand className="h-4 w-4" />
        Reset
      </button>
    )}
  </div>
);
