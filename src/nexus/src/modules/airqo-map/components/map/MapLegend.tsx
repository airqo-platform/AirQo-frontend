'use client';

import React, { useEffect, useState } from 'react';
import { Tooltip } from 'flowbite-react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { cn } from '@/shared/lib/utils';
import { isMobile } from '@/shared/utils/responsive';
import {
  getAirQualityIconForRangeKey,
  type PollutantType,
} from '@/shared/utils/airQuality';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';

interface MapLegendProps {
  className?: string;
  defaultCollapsed?: boolean;
  pollutant?: PollutantType;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  className,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return isMobile(window.innerWidth) || defaultCollapsed;
    }
    return defaultCollapsed;
  });
  const { config, isLoading } = useAqiConfig();
  const ranges = [...(config?.ranges ?? [])].sort(
    (a, b) => a.display_order - b.display_order
  );

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
        isCollapsed ? 'w-12 h-12' : 'w-30 h-auto',
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
        <div className="px-2 pb-2 space-y-1">
          {isLoading && (
            <p className="px-1 py-2 text-xs text-gray-500">
              Loading AQI ranges…
            </p>
          )}
          {ranges.map(range => {
            const IconComponent = getAirQualityIconForRangeKey(range.key);
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
                        {range.max_value === null ? '∞' : range.max_value}{' '}
                        µg/m³
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
