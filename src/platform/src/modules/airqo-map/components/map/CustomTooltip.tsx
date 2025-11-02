'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import {
  getAirQualityLevel,
  getAirQualityIcon,
  getAirQualityColor,
  getAirQualityLabel,
} from '@/shared/utils/airQuality';
import type { AirQualityReading, ClusterData } from './MapNodes';

interface CustomTooltipProps {
  data: AirQualityReading | ClusterData | null;
  position?: { x: number; y: number };
  className?: string;
}

const formatValue = (value: number): string => {
  return value.toFixed(1);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  data,
  position,
  className,
}) => {
  if (!data) return null;

  // Check if it's a cluster
  const isCluster = 'readings' in data && 'pointCount' in data;

  if (isCluster) {
    const cluster = data as ClusterData;
    const avgPM25 =
      cluster.readings.reduce((sum, r) => sum + r.pm25Value, 0) /
      cluster.readings.length;
    const avgPM10 =
      cluster.readings.reduce((sum, r) => sum + r.pm10Value, 0) /
      cluster.readings.length;
    const worstPM25 = Math.max(...cluster.readings.map(r => r.pm25Value));

    const avgLevel = getAirQualityLevel(avgPM25, 'pm2_5');
    const worstLevel = getAirQualityLevel(worstPM25, 'pm2_5');
    const AvgIconComponent = getAirQualityIcon(avgLevel);
    const WorstIconComponent = getAirQualityIcon(worstLevel);
    const avgColor = getAirQualityColor(avgLevel);
    const worstColor = getAirQualityColor(worstLevel);

    return (
      <div
        className={cn(
          'absolute top-4 left-1/2 transform -translate-x-1/2 z-20',
          'bg-white rounded-lg shadow-xl border border-gray-200 p-3 max-w-sm w-full mx-4',
          'sm:p-4 sm:mx-0 sm:w-auto',
          className
        )}
        style={position ? { left: position.x, top: position.y } : undefined}
      >
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 text-sm mb-2">
            Monitoring Cluster ({cluster.pointCount} stations)
          </h3>

          <div className="space-y-3">
            {/* Average values */}
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: avgColor }}
              >
                <AvgIconComponent className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs text-gray-600">Average</div>
                <div className="text-sm font-medium text-gray-900">
                  {getAirQualityLabel(avgLevel)}
                </div>
                <div className="text-xs text-gray-600">
                  PM2.5: {formatValue(avgPM25)} µg/m³ | PM10:{' '}
                  {formatValue(avgPM10)} µg/m³
                </div>
              </div>
            </div>

            {/* Worst values */}
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: worstColor }}
              >
                <WorstIconComponent className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs text-gray-600">Worst</div>
                <div className="text-sm font-medium text-gray-900">
                  {getAirQualityLabel(worstLevel)}
                </div>
                <div className="text-xs text-gray-600">
                  PM2.5: {formatValue(worstPM25)} µg/m³
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Click to zoom in and see individual stations
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Individual reading
  const reading = data as AirQualityReading;
  const pm25Level = getAirQualityLevel(reading.pm25Value, 'pm2_5');
  const pm10Level = getAirQualityLevel(reading.pm10Value, 'pm10');
  const PM25IconComponent = getAirQualityIcon(pm25Level);
  const PM10IconComponent = getAirQualityIcon(pm10Level);
  const pm25Color = getAirQualityColor(pm25Level);
  const pm10Color = getAirQualityColor(pm10Level);

  return (
    <div
      className={cn(
        'absolute top-4 left-1/2 transform -translate-x-1/2 z-20',
        'bg-white rounded-lg shadow-xl border border-gray-200 p-3 max-w-sm w-full mx-4',
        'sm:p-4 sm:mx-0 sm:w-auto',
        className
      )}
      style={position ? { left: position.x, top: position.y } : undefined}
    >
      <div className="text-center">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">
          {reading.locationName || 'Air Quality Station'}
        </h3>

        <div className="space-y-3 mt-3">
          {/* PM2.5 */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: pm25Color }}
            >
              <PM25IconComponent className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-xs text-gray-600">PM₂.₅</div>
              <div className="text-sm font-medium text-gray-900">
                {getAirQualityLabel(pm25Level)} -{' '}
                {formatValue(reading.pm25Value)} µg/m³
              </div>
            </div>
          </div>

          {/* PM10 */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: pm10Color }}
            >
              <PM10IconComponent className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-xs text-gray-600">PM₁₀</div>
              <div className="text-sm font-medium text-gray-900">
                {getAirQualityLabel(pm10Level, 'WHO', 'PM10')} -{' '}
                {formatValue(reading.pm10Value)} µg/m³
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Site:</span>
            <span className="text-gray-900">{reading.siteId}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Provider:</span>
            <span className="text-gray-900">{reading.provider}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Status:</span>
            <span
              className={cn(
                'font-medium',
                reading.status === 'active' && 'text-green-600',
                reading.status === 'inactive' && 'text-red-600',
                reading.status === 'maintenance' && 'text-yellow-600'
              )}
            >
              {reading.status || 'Active'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Updated:</span>
            <span className="text-gray-900">
              {formatDate(reading.lastUpdated)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
