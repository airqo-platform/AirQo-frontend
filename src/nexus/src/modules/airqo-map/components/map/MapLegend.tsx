'use client';

import React, { useEffect, useState } from 'react';
import { Tooltip } from 'flowbite-react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { cn } from '@/shared/lib/utils';
import { isMobile } from '@/shared/utils/responsive';
import { getAirQualityIconForRangeKey } from '@/shared/utils/airQuality';
import type { AqiConfig, AqiRange } from '@/shared/types/aqi';

type MapDetailType = 'emoji' | 'heatmap' | 'node' | 'number';

const FALLBACK_HEATMAP_RANGES: AqiRange[] = [
  {
    key: 'good',
    label: 'Good',
    min_value: 0,
    max_value: null,
    color: '#00e400',
    display_order: 1,
  },
  {
    key: 'moderate',
    label: 'Moderate',
    min_value: 0,
    max_value: null,
    color: '#ffff00',
    display_order: 2,
  },
  {
    key: 'u4sg',
    label: 'Unhealthy for sensitive groups',
    min_value: 0,
    max_value: null,
    color: '#ff7e00',
    display_order: 3,
  },
  {
    key: 'unhealthy',
    label: 'Unhealthy',
    min_value: 0,
    max_value: null,
    color: '#ff0000',
    display_order: 4,
  },
  {
    key: 'very_unhealthy',
    label: 'Very unhealthy',
    min_value: 0,
    max_value: null,
    color: '#8f3f98',
    display_order: 5,
  },
  {
    key: 'hazardous',
    label: 'Hazardous',
    min_value: 0,
    max_value: null,
    color: '#7e0023',
    display_order: 6,
  },
];

interface MapLegendProps {
  className?: string;
  defaultCollapsed?: boolean;
  config?: AqiConfig | null;
  isLoading?: boolean;
  error?: unknown;
  nodeType?: MapDetailType;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  className,
  defaultCollapsed = false,
  config = null,
  isLoading = false,
  error,
  nodeType = 'emoji',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return isMobile(window.innerWidth) || defaultCollapsed;
    }
    return defaultCollapsed;
  });
  const ranges = [...(config?.ranges ?? [])].sort(
    (a, b) => a.display_order - b.display_order
  );
  const heatmapRanges = ranges.length > 0 ? ranges : FALLBACK_HEATMAP_RANGES;
  const isHeatmapMode = nodeType === 'heatmap';
  const usesColorLegend = nodeType !== 'emoji';

  const formatRange = (range: AqiRange): string | null => {
    if (ranges.length === 0) return null;
    return `${range.min_value}–${range.max_value === null ? '∞' : range.max_value} µg/m³`;
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (typeof window !== 'undefined' && isMobile(window.innerWidth)) {
          setIsCollapsed(true);
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className={cn(
        'absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-full shadow-xl border border-gray-200/50 z-[1100]',
        'transition-all duration-300 ease-in-out',
        isCollapsed
          ? 'h-12 w-12'
          : usesColorLegend
            ? 'h-auto w-56 rounded-2xl'
            : 'h-auto w-30',
        className
      )}
    >
      <div
        className={cn(
          'flex justify-center items-center cursor-pointer transition-all duration-300',
          isCollapsed ? 'w-full h-full' : 'p-2'
        )}
      >
        <button
          type="button"
          className={cn(
            'text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100',
            isCollapsed
              ? 'w-full h-full flex items-center justify-center'
              : 'p-1'
          )}
          aria-label={isCollapsed ? 'Expand legend' : 'Collapse legend'}
          onClick={() => setIsCollapsed(value => !value)}
        >
          {isCollapsed ? (
            <IoChevronUp className="w-6 h-6" />
          ) : (
            <IoChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div
          className={cn('space-y-1 px-2 pb-2', isHeatmapMode && 'px-3 pb-3')}
        >
          {usesColorLegend && (
            <div className="px-1 pb-1 pt-0.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wide text-gray-700">
                  {isHeatmapMode ? 'Heatmap key' : 'Air quality key'}
                </span>
                <span className="text-[10px] text-gray-400">
                  {nodeType === 'number' ? 'Value scale' : 'Color scale'}
                </span>
              </div>
              <div
                className="mt-2 flex h-2 overflow-hidden rounded-full"
                aria-label="Air quality colors from good to hazardous"
                role="img"
              >
                {heatmapRanges.map(range => (
                  <span
                    key={`gradient-${range.key}`}
                    className="min-w-0 flex-1"
                    style={{ backgroundColor: range.color }}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[9px] font-medium text-gray-400">
                <span>Lower concentration</span>
                <span>Higher</span>
              </div>
            </div>
          )}
          {isLoading && (
            <p className="px-1 py-2 text-xs text-gray-500">
              Loading AQI ranges…
            </p>
          )}
          {Boolean(error) && !config && (
            <p className="px-1 py-2 text-xs text-red-600">
              AQI ranges unavailable for this pollutant.
            </p>
          )}
          {(usesColorLegend ? heatmapRanges : ranges).map(range => {
            const IconComponent = getAirQualityIconForRangeKey(range.key);
            const rangeText = formatRange(range);

            if (usesColorLegend) {
              return (
                <div
                  key={range.key}
                  className="flex items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-gray-50/80"
                  title={`${range.label}${rangeText ? ` · ${rangeText}` : ''}`}
                >
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 rounded-[4px] border border-black/10 shadow-sm"
                    style={{ backgroundColor: range.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-gray-700">
                    {range.label}
                  </span>
                  {rangeText && (
                    <span className="shrink-0 text-[9px] text-gray-400">
                      {rangeText}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <div
                key={range.key}
                className="flex items-center gap-2 py-1 px-1 rounded-lg hover:bg-gray-50/80 transition-all cursor-pointer group"
              >
                <Tooltip
                  content={
                    <div className="w-[250px] flex flex-col justify-center items-center">
                      <div className="font-semibold text-muted-foreground mb-1 text-center leading-tight">
                        Air Quality is {range.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {range.min_value}–
                        {range.max_value === null ? '∞' : range.max_value} µg/m³
                      </div>
                    </div>
                  }
                  placement="right"
                  style="light"
                  className="ml-3 z-[9999]"
                >
                  <span style={{ color: range.color }}>
                    <IconComponent className="w-7 h-7" />
                  </span>
                </Tooltip>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
