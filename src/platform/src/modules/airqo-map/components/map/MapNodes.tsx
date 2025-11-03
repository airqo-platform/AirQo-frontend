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
  mostCommonLevel?: string;
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

export const MapNodes: React.FC<MapNodesProps> = React.memo(
  ({
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
                'cursor-pointer pointer-events-auto transition-all duration-200',
                'hover:scale-110 hover:z-[100]',
                isSelected && 'z-[50] scale-110',
                isInactive && 'opacity-60',
                className
              )}
              onClick={handleClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              role="button"
              tabIndex={0}
              aria-label={`Air quality reading: ${reading.pm25Value} PM2.5 at ${reading.locationName || 'Unknown location'}`}
              style={{ cursor: 'pointer !important' }}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-full border-2 border-primary animate-pulse"
                  style={{
                    transform: 'scale(1.3)',
                    backgroundColor: 'hsl(var(--primary) / 0.1)',
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
                'cursor-pointer pointer-events-auto transition-all duration-200',
                'hover:scale-110 hover:z-[100]',
                isSelected && 'z-[50] scale-110',
                isInactive && 'opacity-60',
                className
              )}
              onClick={handleClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              role="button"
              tabIndex={0}
              aria-label={`Air quality reading: ${reading.pm25Value} PM2.5 at ${reading.locationName || 'Unknown location'}`}
              style={{ cursor: 'pointer !important' }}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-full border-2 border-primary animate-pulse"
                  style={{
                    transform: 'scale(1.3)',
                    backgroundColor: 'hsl(var(--primary) / 0.1)',
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
                'cursor-pointer pointer-events-auto transition-all duration-200',
                'hover:scale-110 hover:z-[100]',
                isSelected && 'z-[50] scale-110',
                isInactive && 'opacity-60',
                className
              )}
              onClick={handleClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              role="button"
              tabIndex={0}
              aria-label={`Air quality reading: ${reading.pm25Value} PM2.5 at ${reading.locationName || 'Unknown location'}`}
              style={{ cursor: 'pointer !important' }}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-full border-2 border-primary animate-pulse"
                  style={{
                    transform: 'scale(1.3)',
                    backgroundColor: 'hsl(var(--primary) / 0.1)',
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
      // Get the best and worst air quality levels from the cluster
      const readings = cluster.readings || [];
      const pm25Values = readings.map(r => r.pm25Value).filter(v => !isNaN(v));

      // Get different levels for visual variety
      const bestValue = Math.min(...pm25Values);
      const worstValue = Math.max(...pm25Values);

      const bestLevel = getAirQualityLevel(bestValue, 'pm2_5');
      const worstLevel = getAirQualityLevel(worstValue, 'pm2_5');

      const BestIcon = getAirQualityIcon(bestLevel);
      const WorstIcon = getAirQualityIcon(worstLevel);

      return (
        <CustomTooltip data={cluster}>
          <div
            className={cn(
              'flex items-center cursor-pointer pointer-events-auto transition-all duration-300',
              'hover:scale-110 hover:z-[100]',
              className
            )}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={0}
            aria-label={`Cluster of ${cluster.pointCount} air quality monitoring stations`}
            style={{ cursor: 'pointer !important' }}
          >
            {/* Background container for styling */}
            <div className="bg-white rounded-full px-2 py-2 shadow-lg border border-gray-200 flex items-center">
              {/* Icons without backgrounds */}
              <BestIcon className="w-6 h-6 text-gray-700 drop-shadow-sm" />
              <WorstIcon className="w-6 h-6 text-gray-700 drop-shadow-sm -ml-2" />

              {/* Count text */}
              <span className="ml-1 text-sm font-semibold text-gray-700">
                + {cluster.pointCount}
              </span>
            </div>
          </div>
        </CustomTooltip>
      );
    }

    return null;
  }
);

MapNodes.displayName = 'MapNodes';
