'use client';
import React, { useState } from 'react';
import { Tooltip } from 'flowbite-react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { cn } from '@/shared/lib/utils';
import {
  POLLUTANT_RANGES,
  getAirQualityIcon,
  mapAqiCategoryToLevel,
  type PollutantType,
} from '@/shared/utils/airQuality';

interface MapLegendProps {
  className?: string;
  defaultCollapsed?: boolean;
  pollutant?: PollutantType;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  className,
  defaultCollapsed = false,
  pollutant = 'pm2_5',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Convert POLLUTANT_RANGES to displayable format
  const getPollutantRanges = (pollutantType: PollutantType) => {
    const ranges = POLLUTANT_RANGES[pollutantType];
    if (!ranges) return [];

    // Sort by limit ascending
    const sortedRanges = [...ranges].sort((a, b) => a.limit - b.limit);
    const displayRanges = [];

    for (let i = 0; i < sortedRanges.length - 1; i++) {
      const current = sortedRanges[i];
      const next = sortedRanges[i + 1];

      // Skip invalid category
      if (current.category === 'Invalid') continue;

      // For the last valid range, use Infinity as max
      const isLastValid =
        i === sortedRanges.length - 2 || next.category === 'Invalid';
      const max = isLastValid ? Infinity : next.limit;

      displayRanges.push({
        level: current.category,
        min: current.limit,
        max: max,
      });
    }

    return displayRanges;
  };

  const ranges = getPollutantRanges(pollutant);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={cn(
        'absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-full shadow-xl border border-gray-200/50 z-[1100]',
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
          {ranges.map(range => {
            const level = mapAqiCategoryToLevel(range.level);
            const IconComponent = getAirQualityIcon(level);

            // Map category to display name
            const displayNameMapping: Record<string, string> = {
              GoodAir: 'Good',
              ModerateAir: 'Moderate',
              UnhealthyForSensitiveGroups: 'Unhealthy for Sensitive Groups',
              Unhealthy: 'Unhealthy',
              VeryUnhealthy: 'Very Unhealthy',
              Hazardous: 'Hazardous',
            };

            const displayName = displayNameMapping[range.level] || range.level;

            return (
              <div
                key={range.level}
                className="flex items-center gap-2 py-1 px-1 rounded-lg hover:bg-gray-50/80 transition-all cursor-pointer group"
              >
                <Tooltip
                  content={
                    <div className="w-[250px] flex flex-col justify-center items-center">
                      <div className="font-semibold text-muted-foreground mb-1 text-center leading-tight">
                        Air Quality is {displayName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {range.min}-{range.max === Infinity ? '∞' : range.max}{' '}
                        µg/m³
                      </div>
                    </div>
                  }
                  placement="auto"
                  style="light"
                  className="ml-3 z-[1000]"
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
