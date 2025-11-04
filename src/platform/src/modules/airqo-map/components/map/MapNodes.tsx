'use client';

import React from 'react';
import { cn, truncateDecimals } from '@/shared/lib/utils';
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
  isPrimary?: boolean;
  aqiCategory?: string;
  aqiColor?: string;
  pollutantValue?: number;
  pollutantType?: 'pm2_5' | 'pm10';
  // Add reference to full reading data for details panel
  fullReadingData?: import('../../../../shared/types/api').MapReading;
}

export interface ClusterData {
  id: string;
  longitude: number;
  latitude: number;
  pointCount: number;
  readings: AirQualityReading[];
  mostCommonLevel?: string;
}

import type { PollutantType } from '@/modules/airqo-map/utils/dataNormalization';

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
  isHovered?: boolean;
  className?: string;
  selectedPollutant?: PollutantType;
  zoomLevel?: number; // Add zoom level for cluster styling
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

// Enhanced z-index calculation for proper layering with hover support
const getZIndexClasses = (
  isSelected: boolean,
  isHovered: boolean,
  isPrimary: boolean,
  isCluster: boolean
) => {
  // Base z-index levels (higher for more important items)
  const baseLevels = {
    cluster: 30,
    primary: 20,
    regular: 10,
  };

  const baseLevel = isCluster
    ? baseLevels.cluster
    : isPrimary
      ? baseLevels.primary
      : baseLevels.regular;

  // Priority modifiers (higher numbers = higher priority)
  const modifiers = {
    base: 0,
    selected: 200,
    hovered: 300,
    selectedHovered: 400,
  };

  let modifier = modifiers.base;
  if (isSelected && isHovered) {
    modifier = modifiers.selectedHovered;
  } else if (isHovered) {
    modifier = modifiers.hovered;
  } else if (isSelected) {
    modifier = modifiers.selected;
  }

  return `z-[${baseLevel + modifier}]`;
};

const MapNodesComponent: React.FC<MapNodesProps> = ({
  reading,
  cluster,
  size = 'md',
  nodeType = 'emoji',
  onClick,
  onHover,
  isSelected = false,
  isHovered = false,
  className,
  selectedPollutant = 'pm2_5',
  zoomLevel = 10,
}) => {
  // Determine if this is a cluster or individual node
  const isCluster = cluster && cluster.pointCount > 1;
  const data = cluster || reading;

  if (!data) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClick?.(data);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onHover?.(data);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onHover?.(null);
  };

  // Render individual node
  if (!isCluster && reading) {
    const pollutantValue = reading.pollutantValue ?? reading.pm25Value;
    const pollutantType = reading.pollutantType ?? selectedPollutant;
    const level = getAirQualityLevel(pollutantValue, pollutantType);
    const IconComponent = getAirQualityIcon(level);
    const sizeClasses = getSizeClasses(size);
    const isInactive =
      reading.status === 'inactive' || reading.status === 'maintenance';
    const isPrimaryReading = reading.isPrimary !== false;

    // Different rendering based on nodeType
    if (nodeType === 'number') {
      return (
        <CustomTooltip data={reading} selectedPollutant={selectedPollutant}>
          <div
            className={cn(
              'relative cursor-pointer pointer-events-auto transition-all duration-150',
              'hover:scale-105 active:scale-95',
              getZIndexClasses(isSelected, isHovered, isPrimaryReading, false),
              isInactive && 'opacity-60',
              className
            )}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const syntheticEvent = e as unknown as React.MouseEvent;
                handleClick(syntheticEvent);
              }
            }}
            aria-label={`Air quality reading: ${reading.pm25Value} PM2.5 at ${reading.locationName || 'Unknown location'}`}
            style={{
              cursor: 'pointer',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
          >
            {/* Selection indicator with clean pulse effect */}
            {isSelected && (
              <div className="absolute -inset-1 rounded-full">
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse opacity-75" />
                <div className="absolute inset-0 rounded-full border border-primary/50 animate-ping" />
              </div>
            )}

            {/* Number node */}
            <div
              className={cn(
                'rounded-full border-2 border-white shadow flex items-center justify-center relative transition-all duration-200 font-bold text-white',
                sizeClasses,
                level === 'good' && 'bg-green-500',
                level === 'moderate' && 'bg-yellow-500',
                level === 'unhealthy-sensitive-groups' && 'bg-orange-500',
                level === 'unhealthy' && 'bg-red-500',
                level === 'very-unhealthy' && 'bg-purple-500',
                level === 'hazardous' && 'bg-red-900'
              )}
            >
              {truncateDecimals(reading.pm25Value, 2)}
            </div>
          </div>
        </CustomTooltip>
      );
    } else if (nodeType === 'node') {
      return (
        <CustomTooltip data={reading} selectedPollutant={selectedPollutant}>
          <div
            className={cn(
              'relative cursor-pointer pointer-events-auto transition-all duration-150',
              'hover:scale-105 active:scale-95',
              getZIndexClasses(isSelected, isHovered, isPrimaryReading, false),
              isInactive && 'opacity-60',
              className
            )}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const syntheticEvent = e as unknown as React.MouseEvent;
                handleClick(syntheticEvent);
              }
            }}
            aria-label={`Air quality reading: ${reading.pm25Value} PM2.5 at ${reading.locationName || 'Unknown location'}`}
            style={{
              cursor: 'pointer',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
          >
            {/* Selection indicator with clean pulse effect */}
            {isSelected && (
              <div className="absolute -inset-1 rounded-full">
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse opacity-75" />
                <div className="absolute inset-0 rounded-full border border-primary/50 animate-ping" />
              </div>
            )}

            {/* Colored node */}
            <div
              className={cn(
                'rounded-full border-2 border-white shadow relative transition-all duration-200',
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
      return (
        <CustomTooltip data={reading} selectedPollutant={selectedPollutant}>
          <div
            className={cn(
              'relative cursor-pointer pointer-events-auto transition-all duration-150',
              'hover:scale-105 active:scale-95',
              getZIndexClasses(isSelected, isHovered, isPrimaryReading, false),
              isInactive && 'opacity-60',
              className
            )}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const syntheticEvent = e as unknown as React.MouseEvent;
                handleClick(syntheticEvent);
              }
            }}
            aria-label={`Air quality reading: ${reading.pm25Value} PM2.5 at ${reading.locationName || 'Unknown location'}`}
            style={{
              cursor: 'pointer',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
          >
            {/* Selection indicator with clean pulse effect */}
            {isSelected && (
              <div className="absolute -inset-1 rounded-full">
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse opacity-75" />
                <div className="absolute inset-0 rounded-full border border-primary/50 animate-ping" />
              </div>
            )}

            {/* Main node */}
            <div
              className={cn(
                'rounded-full border-2 border-white shadow flex items-center justify-center relative transition-all duration-200 bg-white',
                sizeClasses
              )}
            >
              <IconComponent
                className={cn(
                  'text-gray-700',
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
    const readings = cluster.readings || [];
    const validReadings = readings.filter(r => !isNaN(r.pm25Value));

    if (validReadings.length === 0) return null;

    const pm25Values = validReadings.map(r => r.pm25Value);
    const sortedValues = [...pm25Values].sort((a, b) => a - b);

    const bestValue = sortedValues[0];
    const worstValue = sortedValues[sortedValues.length - 1];

    const bestLevel = getAirQualityLevel(bestValue, 'pm2_5');
    const worstLevel = getAirQualityLevel(worstValue, 'pm2_5');

    const BestIcon = getAirQualityIcon(bestLevel);
    const WorstIcon = getAirQualityIcon(worstLevel);

    const totalCount = cluster.pointCount;
    const showPlusCount = totalCount > 2;
    const displayCount = showPlusCount
      ? `+${totalCount - 2}`
      : totalCount.toString();

    const isHighZoom = zoomLevel >= 12;
    const clusterSize = isHighZoom ? 'px-2 py-1' : 'px-3 py-1.5';
    const iconSize = isHighZoom ? 'w-6 h-6' : 'w-7 h-7';
    const textSize = isHighZoom ? 'text-sm font-bold' : 'text-base font-bold';

    return (
      <CustomTooltip data={cluster} selectedPollutant={selectedPollutant}>
        <div
          className={cn(
            'relative flex items-center cursor-pointer pointer-events-auto transition-all duration-200',
            'hover:scale-105 active:scale-95',
            getZIndexClasses(isSelected, isHovered, false, true),
            isHighZoom && 'opacity-100',
            className
          )}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              const syntheticEvent = e as unknown as React.MouseEvent;
              handleClick(syntheticEvent);
            }
          }}
          aria-label={`Cluster of ${cluster.pointCount} air quality monitoring stations`}
          style={{
            cursor: 'pointer',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'auto',
          }}
        >
          <div
            className={cn(
              'bg-white rounded-full shadow flex items-center relative',
              clusterSize
            )}
          >
            <div className="flex items-center relative">
              <BestIcon className={cn('text-gray-700 z-10', iconSize)} />
              {validReadings.length > 1 && (
                <WorstIcon
                  className={cn('text-gray-700 -ml-3 z-5', iconSize)}
                />
              )}
            </div>
            <span className={cn('text-gray-800 ml-2', textSize)}>
              {displayCount}
            </span>
          </div>
        </div>
      </CustomTooltip>
    );
  }

  return null;
};

// Optimize memo comparison
const areEqual = (prevProps: MapNodesProps, nextProps: MapNodesProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.nodeType === nextProps.nodeType &&
    prevProps.size === nextProps.size &&
    prevProps.selectedPollutant === nextProps.selectedPollutant &&
    prevProps.reading?.id === nextProps.reading?.id &&
    prevProps.cluster?.id === nextProps.cluster?.id &&
    prevProps.reading?.pm25Value === nextProps.reading?.pm25Value &&
    prevProps.reading?.pm10Value === nextProps.reading?.pm10Value
  );
};

export const MapNodes = React.memo(MapNodesComponent, areEqual);
MapNodes.displayName = 'MapNodes';
