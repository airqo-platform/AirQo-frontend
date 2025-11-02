'use client';

import React, { useState } from 'react';
import { Tooltip } from 'flowbite-react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { cn } from '@/shared/lib/utils';
import {
  WHO_PM25_STANDARDS,
  getAirQualityIcon,
  mapAqiCategoryToLevel,
} from '@/shared/utils/airQuality';

interface MapLegendProps {
  className?: string;
  defaultCollapsed?: boolean;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  className,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const standards = WHO_PM25_STANDARDS;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={cn(
        'absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-full shadow-xl border border-gray-200/50 z-10',
        'transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-12 h-12' : 'w-30 h-auto',
        className
      )}
    >
      {/* Header - arrow button always visible */}
      <div
        className={cn(
          'flex justify-center items-center cursor-pointer transition-all duration-300',
          isCollapsed ? 'w-full h-full' : 'p-2'
        )}
      >
        <button
          className={cn(
            'text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100',
            isCollapsed
              ? 'w-full h-full flex items-center justify-center'
              : 'p-1'
          )}
          aria-label={isCollapsed ? 'Expand legend' : 'Collapse legend'}
          onClick={toggleCollapse}
        >
          {isCollapsed ? (
            <IoChevronUp className="w-6 h-6" />
          ) : (
            <IoChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Legend items - only show when expanded */}
      {!isCollapsed && (
        <div className="px-2 pb-2 space-y-1">
          {standards.map(standard => {
            const level = mapAqiCategoryToLevel(standard.level);
            const IconComponent = getAirQualityIcon(level);

            return (
              <div
                key={standard.level}
                className="flex items-center gap-2 py-1 px-1 rounded-lg hover:bg-gray-50/80 transition-all cursor-pointer group"
              >
                <Tooltip
                  content={
                    <div className="w-[250px] flex flex-col justify-center items-center">
                      <div className="font-semibold mb-1">{standard.level}</div>
                      <div className="text-xs">
                        {standard.range.min}-
                        {standard.range.max === Infinity
                          ? '∞'
                          : standard.range.max}{' '}
                        µg/m³
                      </div>
                    </div>
                  }
                  placement="right"
                  style="light"
                  className="z-[1000]"
                >
                  <IconComponent className="w-7 h-7" />
                </Tooltip>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
