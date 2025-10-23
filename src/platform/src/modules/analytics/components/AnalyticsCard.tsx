'use client';

import React, { memo, useRef, useState, useCallback } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import type { AnalyticsCardProps } from '../types';
import type { AirQualityLevel } from '../types';
import { getAirQualityColor, getAirQualityLabel } from '..';
import { mapAqiCategoryToLevel } from '../utils';
import { Tooltip } from 'flowbite-react';
import {
  AIR_QUALITY_ICONS,
  TREND_ICONS,
} from '@/shared/components/charts/constants';
import { getPollutantLabel } from '@/shared/components/charts/utils';
import type { PollutantType } from '@/shared/components/charts/types';
import { useResizeObserver } from '@/shared/hooks';
import { AqWind01 } from '@airqo/icons-react';

export const AnalyticsCard: React.FC<AnalyticsCardProps> = memo(
  ({ siteData, className, showIcon = true, selectedPollutant, onClick }) => {
    // truncation refs
    const nameRef = useRef<HTMLHeadingElement>(null);
    const locationRef = useRef<HTMLParagraphElement>(null);
    const [isNameTruncated, setIsNameTruncated] = useState(false);
    const [isLocationTruncated, setIsLocationTruncated] = useState(false);

    const checkTruncation = useCallback(() => {
      if (nameRef.current) {
        setIsNameTruncated(
          nameRef.current.scrollWidth > nameRef.current.clientWidth
        );
      }
      if (locationRef.current) {
        setIsLocationTruncated(
          locationRef.current.scrollWidth > locationRef.current.clientWidth
        );
      }
    }, []);

    useResizeObserver(nameRef.current, checkTruncation);
    useResizeObserver(locationRef.current, checkTruncation);

    const {
      name,
      location,
      value,
      status: rawStatus,
      aqi_category,
      pollutant,
      trend,
      percentageDifference,
    } = siteData;

    // Prefer the API-provided aqi_category when available and map it to
    // the internal status keys used by the app. Fall back to existing status.
    const status = (
      aqi_category
        ? mapAqiCategoryToLevel(aqi_category)
        : (rawStatus as AirQualityLevel)
    ) as AirQualityLevel;

    const statusColor = getAirQualityColor(status);
    const statusLabel = getAirQualityLabel(status);

    // Use selected pollutant for display, fallback to site data pollutant
    const displayPollutant = selectedPollutant || (pollutant as PollutantType);

    // Format name for display by replacing underscores with spaces
    const displayName = name.replace(/_/g, ' ');

    // Get appropriate icons
    // Narrow types before indexing into the icon maps to satisfy TS
    const AirQualityIcon =
      AIR_QUALITY_ICONS[status as keyof typeof AIR_QUALITY_ICONS];
    const TrendIcon = TREND_ICONS[trend as keyof typeof TREND_ICONS];

    return (
      <Card
        className={cn('w-full cursor-pointer', className)}
        onClick={() => onClick?.(siteData)}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.(siteData);
          }
        }}
      >
        <CardContent className="p-6 flex flex-col justify-between space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <Tooltip content={displayName}>
                <h3
                  ref={nameRef}
                  className="text-md font-semibold  truncate max-w-[140px] mb-1"
                  title={isNameTruncated ? displayName : ''}
                >
                  {displayName}
                </h3>
              </Tooltip>
              <Tooltip content={location}>
                <p
                  ref={locationRef}
                  className="text-sm text-gray-500 truncate max-w-[180px]"
                  title={isLocationTruncated ? location : ''}
                >
                  {location}
                </p>
              </Tooltip>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
              {/* Trend indicator with tooltip */}
              <Tooltip
                content={
                  percentageDifference !== undefined
                    ? `Air quality ${percentageDifference > 0 ? 'worsened' : 'improved'} by ${Math.abs(percentageDifference).toFixed(2)}% compared to last week.`
                    : 'Air quality trend compared to last week.'
                }
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full cursor-help',
                    trend === 'up'
                      ? 'bg-red-100 text-red-500'
                      : trend === 'down'
                        ? 'bg-green-100 text-green-500'
                        : 'bg-gray-100 text-gray-500'
                  )}
                >
                  <TrendIcon className="h-3 w-3" />
                </div>
              </Tooltip>
            </div>
          </div>

          {/* Main value and icon */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Pollutant info above value */}
              <div className="flex items-center gap-2 mb-2">
                <Tooltip content="Air quality pollutant measurement">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                    <AqWind01 className="h-3 w-3 text-gray-600" />
                  </div>
                </Tooltip>
                <div className="text-xs text-gray-600">
                  {status === 'no-value'
                    ? ''
                    : getPollutantLabel(displayPollutant)}
                </div>
              </div>

              <div className="text-3xl font-bold">
                {status === 'no-value' ? '--' : value.toFixed(2)}
              </div>
            </div>

            {/* Air quality icon or status text when hidden */}
            <div className="flex-shrink-0 ml-4 flex items-center justify-center">
              {showIcon ? (
                <Tooltip content={`Air quality status: ${statusLabel}`}>
                  <div style={{ color: statusColor }}>
                    <AirQualityIcon className="h-16 w-16" />
                  </div>
                </Tooltip>
              ) : (
                <div
                  className="text-sm font-medium"
                  style={{ color: statusColor }}
                >
                  {statusLabel}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);
AnalyticsCard.displayName = 'AnalyticsCard';
