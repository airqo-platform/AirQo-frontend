'use client';

import React from 'react';
import { Tooltip } from 'flowbite-react';
import { cn, formatTruncatedNumber } from '@/shared/lib/utils';
import {
  getAirQualityLevel,
  getAirQualityIcon,
  getAirQualityColor,
  getAirQualityLabel,
  getPollutantLabel,
} from '@/shared/utils/airQuality';
import type { AirQualityReading, ClusterData } from './MapNodes';
import type { PollutantType } from '@/shared/utils/airQuality';

interface CustomTooltipProps {
  data: AirQualityReading | ClusterData | null;
  children: React.ReactNode;
  className?: string;
  selectedPollutant?: PollutantType;
}

const formatValue = (value: number): string => {
  return formatTruncatedNumber(value, 2);
};

const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

const getTooltipContent = (
  data: AirQualityReading | ClusterData,
  selectedPollutant: PollutantType = 'pm2_5'
) => {
  // Check if it's a cluster
  const isCluster = 'readings' in data && 'pointCount' in data;

  if (isCluster) {
    const cluster = data as ClusterData;
    const avgValue =
      selectedPollutant === 'pm2_5'
        ? cluster.readings.reduce((sum, r) => sum + r.pm25Value, 0) /
          cluster.readings.length
        : cluster.readings.reduce((sum, r) => sum + r.pm10Value, 0) /
          cluster.readings.length;

    const level = getAirQualityLevel(avgValue, selectedPollutant);
    const IconComponent = getAirQualityIcon(level);
    const color = getAirQualityColor(level);
    const label = getAirQualityLabel(level);

    return (
      <div className="p-2 min-w-[250px] w-full max-w-[350px]">
        <div className="text-left mb-2">
          <div className="text-xs text-gray-500">{formatDate(new Date())}</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
            <div className="font-medium text-gray-900 text-sm">
              Cluster ({cluster.pointCount} stations)
            </div>
          </div>
        </div>

        <div className="text-left w-full flex items-center justify-between">
          <div className="flex flex-col items-left gap-1 mb-1">
            <div className="text-sm font-medium" style={{ color }}>
              {label}
            </div>
            <div className="text-sm text-gray-900">
              {formatValue(avgValue)} µg/m³{' '}
              {getPollutantLabel(selectedPollutant)}
            </div>
          </div>
          <div className="flex-shrink-0">
            <IconComponent className="w-9 h-9" />
          </div>
        </div>

        <div className="text-left mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">Click to zoom in</div>
        </div>
      </div>
    );
  }

  // Individual reading
  const reading = data as AirQualityReading;
  const pollutantValue =
    selectedPollutant === 'pm2_5' ? reading.pm25Value : reading.pm10Value;
  const level = getAirQualityLevel(pollutantValue, selectedPollutant);
  const IconComponent = getAirQualityIcon(level);
  const color = getAirQualityColor(level);
  const label = getAirQualityLabel(level);

  return (
    <div className="p-2 min-w-[250px] max-w-[350px]">
      <div className="text-left mb-2">
        <div className="text-xs text-gray-500">
          {formatDate(reading.lastUpdated)}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
          <div className="font-medium text-gray-900 text-sm">
            {reading.locationName || 'Air Quality Station'}
          </div>
        </div>
      </div>

      <div className="text-left flex items-center justify-between w-full">
        <div className="flex flex-col items-left gap-1 mb-1">
          <div className="text-sm font-medium" style={{ color }}>
            {label}
          </div>
          <div className="text-sm text-gray-900">
            {formatValue(pollutantValue)} µg/m³{' '}
            {getPollutantLabel(selectedPollutant)}
          </div>
        </div>
        <div className="flex-shrink-0" style={{ color }}>
          <IconComponent className="w-9 h-9" />
        </div>
      </div>

      <div className="text-left mt-2 pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Provider: {reading.provider}
        </div>
      </div>
    </div>
  );
};

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  data,
  children,
  className,
  selectedPollutant = 'pm2_5',
}) => {
  if (!data) {
    return <>{children}</>;
  }

  return (
    <Tooltip
      content={getTooltipContent(data, selectedPollutant)}
      placement="top"
      style="light"
      className={cn(
        'z-[10000000] !important transform-gpu pointer-events-none',
        className
      )}
      trigger="hover"
      arrow={true}
      animation="duration-150"
    >
      <div className="inline-block relative z-[1] isolate pointer-events-auto">
        {children}
      </div>
    </Tooltip>
  );
};
