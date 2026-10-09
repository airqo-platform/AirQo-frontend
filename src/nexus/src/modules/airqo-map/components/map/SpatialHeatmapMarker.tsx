'use client';

import React from 'react';
import { AqLayersThree01 } from '@airqo/icons-react';
import type { SpatialHeatmap } from '@/shared/types/api';
import { cn } from '@/shared/lib/utils';

interface SpatialHeatmapMarkerProps {
  heatmap: SpatialHeatmap;
  isSelected?: boolean;
  isCompact?: boolean;
  isVisible?: boolean;
  onClick: (heatmap: SpatialHeatmap) => void;
}

const formatCityName = (city: string): string =>
  city
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());

/**
 * A deliberately prominent overview pointer for a city heatmap. The raster
 * itself is city-sized and can disappear at continent zoom, so this DOM marker
 * acts as the discoverable entry point into that raster.
 */
export const SpatialHeatmapMarker: React.FC<SpatialHeatmapMarkerProps> = ({
  heatmap,
  isSelected = false,
  isCompact = false,
  isVisible = true,
  onClick,
}) => {
  const cityName = formatCityName(heatmap.city);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center transition-all duration-300 ease-out motion-reduce:transition-none',
        !isVisible && 'pointer-events-none scale-90 opacity-0'
      )}
      aria-hidden={!isVisible}
    >
      {!isCompact && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute -inset-2 rounded-full bg-cyan-400/20',
            isSelected &&
              'animate-ping bg-cyan-400/35 motion-reduce:animate-none'
          )}
        />
      )}
      <button
        type="button"
        onClick={event => {
          event.stopPropagation();
          onClick(heatmap);
        }}
        className={cn(
          'group relative flex items-center rounded-full border-2 border-white bg-slate-950/95 text-left text-white shadow-[0_8px_24px_rgba(15,23,42,0.35)] transition-all duration-200 motion-reduce:transition-none hover:scale-105 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-white',
          isCompact ? 'h-10 w-10 justify-center' : 'gap-2 px-2.5 py-2',
          isSelected && 'ring-2 ring-cyan-300 ring-offset-2'
        )}
        style={{
          pointerEvents: isVisible ? 'auto' : 'none',
          touchAction: 'manipulation',
        }}
        tabIndex={isVisible ? 0 : -1}
        aria-label={`Open ${cityName} air quality heatmap`}
        title={`Open ${cityName} heatmap`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-slate-950">
          <AqLayersThree01 size={16} />
        </span>
        {!isCompact && (
          <span className="min-w-0 pr-1">
            <span className="block max-w-[115px] truncate text-xs font-bold leading-tight">
              {cityName}
            </span>
            <span className="mt-0.5 block text-[10px] font-medium leading-tight text-cyan-100">
              Explore heatmap
            </span>
          </span>
        )}
      </button>
      <span
        aria-hidden="true"
        className="-mt-px h-2.5 w-2.5 rotate-45 border-b-2 border-r-2 border-white bg-slate-950"
      />
    </div>
  );
};
