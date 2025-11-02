'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import {
  getAirQualityLevel,
  getAirQualityIcon,
} from '@/shared/utils/airQuality';
import { CustomTooltip } from './CustomTooltip';

// Consolidated component for rendering both individual nodes and clusters
export interface AirQualityReading {
  id: string;
  siteId: string;
  longitude: number;
  latitude: number;
  pm25Value: number;
  pm10Value: number;
  locationName?: string;
  lastUpdated: Date;
  provider: string;
  status?: 'active' | 'inactive' | 'maintenance';
}

export interface ClusterData {
  id: string;
  longitude: number;
  latitude: number;
  pointCount: number;
  readings: AirQualityReading[];
}

interface MapNodesProps {
  // For individual nodes
  reading?: AirQualityReading;
  // For clusters
  cluster?: ClusterData;
  size?: 'sm' | 'md' | 'lg';
  nodeType?: 'emoji' | 'heatmap' | 'node' | 'number';
  onClick?: (data: AirQualityReading | ClusterData) => void;
  onHover?: (data: AirQualityReading | ClusterData | null) => void;
  isSelected?: boolean;
  className?: string;
}

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return 'w-8 h-8';
    case 'lg':
      return 'w-14 h-14';
    default:
      return 'w-10 h-10';
  }
};

const getClusterSize = (pointCount: number, baseSize: 'sm' | 'md' | 'lg') => {
  let multiplier = 1;
  if (pointCount >= 50) multiplier = 2.2;
  else if (pointCount >= 20) multiplier = 1.8;
  else if (pointCount >= 10) multiplier = 1.5;
  else if (pointCount >= 5) multiplier = 1.3;

  const baseSizes = {
    sm: 28,
    md: 40,
    lg: 48,
  };

  const size = Math.min(baseSizes[baseSize] * multiplier, 80);
  return size;
};

const getWorstAirQuality = (readings: AirQualityReading[]): number => {
  if (readings.length === 0) return 0;
  return Math.max(...readings.map(reading => reading.pm25Value));
};

export const MapNodes: React.FC<MapNodesProps> = ({
  reading,
  cluster,
  size = 'md',
  nodeType = 'emoji',
  onClick,
  onHover,
  isSelected = false,
  className,
}) => {
  // Determine if this is a cluster or individual node
  const isCluster = cluster && cluster.pointCount > 1;
  const data = cluster || reading;

  if (!data) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(data);
  };

  const handleMouseEnter = () => {
    onHover?.(data);
  };

  const handleMouseLeave = () => {
    onHover?.(null);
  };

  // Render individual node
  if (!isCluster && reading) {
    const level = getAirQualityLevel(reading.pm25Value, 'pm2_5');
    const IconComponent = getAirQualityIcon(level);
    const sizeClasses = getSizeClasses(size);
    const isInactive =
      reading.status === 'inactive' || reading.status === 'maintenance';

    // Different rendering based on nodeType
    if (nodeType === 'number') {
      // Render as number
      return (
        <CustomTooltip data={reading}>
          <div
            className={cn(
              'cursor-pointer transition-all duration-200',
              'hover:scale-110 hover:z-30',
              isSelected && 'z-20 scale-110',
              isInactive && 'opacity-60',
              className
            )}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={0}
            aria-label={`Air quality reading: ${reading.pm25Value} PM2.5 at ${reading.locationName || 'Unknown location'}`}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div
                className="absolute inset-0 rounded-full border-2 border-blue-500 animate-pulse"
                style={{
                  transform: 'scale(1.3)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                }}
              />
            )}

            {/* Number node */}
            <div
              className={cn(
                'rounded-full border-2 border-white shadow-lg flex items-center justify-center relative transition-all duration-200 font-bold text-white',
                sizeClasses,
                level === 'good' && 'bg-green-500',
                level === 'moderate' && 'bg-yellow-500',
                level === 'unhealthy-sensitive-groups' && 'bg-orange-500',
                level === 'unhealthy' && 'bg-red-500',
                level === 'very-unhealthy' && 'bg-purple-500',
                level === 'hazardous' && 'bg-red-900'
              )}
            >
              {Math.round(reading.pm25Value)}
            </div>
          </div>
        </CustomTooltip>
      );
    } else if (nodeType === 'node') {
      // Render as colored circle without icon
      return (
        <CustomTooltip data={reading}>
          <div
            className={cn(
              'cursor-pointer transition-all duration-200',
              'hover:scale-110 hover:z-30',
              isSelected && 'z-20 scale-110',
              isInactive && 'opacity-60',
              className
            )}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={0}
            aria-label={`Air quality reading: ${reading.pm25Value} PM2.5 at ${reading.locationName || 'Unknown location'}`}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div
                className="absolute inset-0 rounded-full border-2 border-blue-500 animate-pulse"
                style={{
                  transform: 'scale(1.3)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                }}
              />
            )}

            {/* Colored node */}
            <div
              className={cn(
                'rounded-full border-2 border-white shadow-lg relative transition-all duration-200',
                sizeClasses,
                level === 'good' && 'bg-green-500',
                level === 'moderate' && 'bg-yellow-500',
                level === 'unhealthy-sensitive-groups' && 'bg-orange-500',
                level === 'unhealthy' && 'bg-red-500',
                level === 'very-unhealthy' && 'bg-purple-500',
                level === 'hazardous' && 'bg-red-900'
              )}
            />
          </div>
        </CustomTooltip>
      );
    } else {
      // Default 'emoji' rendering with icon
      return (
        <CustomTooltip data={reading}>
          <div
            className={cn(
              'cursor-pointer transition-all duration-200',
              'hover:scale-110 hover:z-30',
              isSelected && 'z-20 scale-110',
              isInactive && 'opacity-60',
              className
            )}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={0}
            aria-label={`Air quality reading: ${reading.pm25Value} PM2.5 at ${reading.locationName || 'Unknown location'}`}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div
                className="absolute inset-0 rounded-full border-2 border-blue-500 animate-pulse"
                style={{
                  transform: 'scale(1.3)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                }}
              />
            )}

            {/* Main node */}
            <div
              className={cn(
                'rounded-full border-2 border-white shadow-lg flex items-center justify-center relative transition-all duration-200 bg-white',
                sizeClasses
              )}
            >
              <IconComponent
                className={cn(
                  'text-gray-700 drop-shadow-sm',
                  size === 'sm' && 'w-5 h-5',
                  size === 'md' && 'w-7 h-7',
                  size === 'lg' && 'w-10 h-10'
                )}
              />

              {/* Status indicator for inactive nodes */}
              {isInactive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border border-white">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CustomTooltip>
      );
    }
  }

  // Render cluster
  if (isCluster && cluster) {
    const worstPM25 = getWorstAirQuality(cluster.readings);
    const level = getAirQualityLevel(worstPM25, 'pm2_5');
    const IconComponent = getAirQualityIcon(level);

    const clusterSize = getClusterSize(cluster.pointCount, size);

    return (
      <CustomTooltip data={cluster}>
        <div
          className={cn(
            'flex items-center cursor-pointer transition-all duration-300',
            'hover:scale-110 hover:z-30',
            className
          )}
          style={{
            width: clusterSize,
            height: clusterSize / 2,
          }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="button"
          tabIndex={0}
          aria-label={`Cluster of ${cluster.pointCount} air quality monitoring stations`}
        >
          {/* First node */}
          <div className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-lg flex items-center justify-center relative z-10 bg-white">
            <IconComponent className="w-7 h-7 text-gray-700 drop-shadow-sm" />
          </div>

          {/* Second node */}
          <div className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-lg flex items-center justify-center relative -ml-3 z-20 bg-white">
            <IconComponent className="w-7 h-7 text-gray-700 drop-shadow-sm" />
          </div>

          {/* Count badge */}
          {cluster.pointCount > 2 && (
            <div className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full -ml-1 z-30 shadow-lg">
              +{cluster.pointCount - 2}
            </div>
          )}
        </div>
      </CustomTooltip>
    );
  }

  return null;
};
