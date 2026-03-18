'use client';

import React from 'react';
import { cn, roundDecimals } from '@/shared/lib/utils';
import {
  getAirQualityLevel,
  getAirQualityIcon,
} from '@/shared/utils/airQuality';
import { CustomTooltip } from './CustomTooltip';
import type { PollutantType } from '@/shared/utils/airQuality';

export interface AirQualityReading {
  id: string;
  siteId: string;
  longitude: number;
  latitude: number;
  pm25Value: number;
  pm10Value: number;
  locationName?: string;
  lastUpdated: Date | string;
  provider: string;
  status?: 'active' | 'inactive' | 'maintenance';
  isPrimary?: boolean;
  deviceCategories?: import('../../../../shared/types/api').DeviceCategories;
  primaryCategory?: string | null;
  deploymentCategory?: string | null;
  aqiCategory?: string;
  aqiColor?: string;
  pollutantValue?: number;
  pollutantType?: 'pm2_5' | 'pm10';
  fullReadingData?: import('../../../../shared/types/api').MapReading;
  forecastData?: import('../../../../shared/types/api').ForecastData[];
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
  reading?: AirQualityReading;
  cluster?: ClusterData;
  size?: 'sm' | 'md' | 'lg';
  nodeType?: 'emoji' | 'heatmap' | 'node' | 'number';
  onClick?: (data: AirQualityReading | ClusterData) => void;
  onHover?: (data: AirQualityReading | ClusterData | null) => void;
  isSelected?: boolean;
  isHovered?: boolean;
  className?: string;
  selectedPollutant?: PollutantType;
  zoomLevel?: number;
  isTooltipOpen?: boolean;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

const ICON_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-10 h-10',
};

// Stable shared button styles — applied directly on the DOM element, not inside a nested component
const NODE_BUTTON_STYLE: React.CSSProperties = {
  touchAction: 'manipulation',
  userSelect: 'none',
  pointerEvents: 'auto',
  cursor: 'pointer',
};

/**
 * CRITICAL: Do NOT define sub-components inside render functions.
 * React treats inline component definitions as new types every render,
 * causing unmount/remount which destroys click handlers.
 *
 * All rendering is done flat inside this single component.
 */
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
  isTooltipOpen = false,
}) => {
  const isCluster = !!(cluster && cluster.pointCount > 1);
  const data = (cluster ?? reading) as AirQualityReading | ClusterData | undefined;

  if (!data) return null;

  // --- Stable event handlers (defined here, not inside nested components) ---
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClick?.(data);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(data);
    }
  };

  const handleMouseEnter = () => onHover?.(data);
  const handleMouseLeave = () => onHover?.(null);

  // ─── Cluster Rendering ──────────────────────────────────────────────────────
  if (isCluster && cluster) {
    const pollutantValues = cluster.readings
      .map(r => (selectedPollutant === 'pm2_5' ? r.pm25Value : r.pm10Value))
      .filter(v => v !== undefined && !isNaN(v));

    if (pollutantValues.length === 0) return null;

    const sortedValues = [...pollutantValues].sort((a, b) => a - b);
    const BestIcon = getAirQualityIcon(
      getAirQualityLevel(sortedValues[0], selectedPollutant)
    );
    const WorstIcon = getAirQualityIcon(
      getAirQualityLevel(sortedValues[sortedValues.length - 1], selectedPollutant)
    );

    const isHighZoom = (zoomLevel ?? 10) >= 12;
    const displayCount =
      cluster.pointCount > 2 ? `+${cluster.pointCount - 2}` : cluster.pointCount;

    return (
      <CustomTooltip
        data={cluster}
        selectedPollutant={selectedPollutant}
        onTooltipAction={() => onClick?.(data)}
        onTooltipHoverChange={hovering => onHover?.(hovering ? data : null)}
      >
        {/* 
          Single flat div — NO nested component definition.
          pointerEvents: auto is essential so mapbox doesn't swallow clicks.
        */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`Cluster of ${cluster.pointCount} air quality stations. Click to zoom in.`}
          className={cn(
            'flex items-center bg-white rounded-full shadow-md border border-gray-200 select-none',
            'transition-transform duration-150',
            'hover:scale-110 active:scale-95',
            isHovered && 'scale-110',
            isHighZoom ? 'px-2 py-1 gap-1' : 'px-3 py-1.5 gap-1.5',
            className
          )}
          style={NODE_BUTTON_STYLE}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center">
            <BestIcon className={isHighZoom ? 'w-6 h-6' : 'w-7 h-7'} />
            {pollutantValues.length > 1 && (
              <WorstIcon
                className={cn(isHighZoom ? 'w-6 h-6' : 'w-7 h-7', '-ml-3')}
              />
            )}
          </div>
          <span
            className={cn(
              'font-black text-gray-800',
              isHighZoom ? 'text-sm' : 'text-base'
            )}
          >
            {displayCount}
          </span>
        </div>
      </CustomTooltip>
    );
  }

  // ─── Individual Node Rendering ──────────────────────────────────────────────
  if (reading) {
    const pollutantValue =
      selectedPollutant === 'pm2_5' ? reading.pm25Value : reading.pm10Value;
    const level = getAirQualityLevel(pollutantValue, selectedPollutant);
    const IconComponent = getAirQualityIcon(level);
    const sizeClass = SIZE_CLASSES[size];
    const iconClass = ICON_CLASSES[size];
    const isInactive =
      reading.status === 'inactive' || reading.status === 'maintenance';

    const ariaLabel = `Air quality: ${roundDecimals(pollutantValue, 1)} ${
      selectedPollutant === 'pm2_5' ? 'PM2.5' : 'PM10'
    } µg/m³ at ${reading.locationName ?? 'Unknown location'}. Click to view details.`;

    const LEVEL_BG: Record<string, string> = {
      good: 'bg-green-500',
      moderate: 'bg-yellow-500',
      'unhealthy-sensitive-groups': 'bg-orange-500',
      unhealthy: 'bg-red-500',
      'very-unhealthy': 'bg-purple-500',
      hazardous: 'bg-red-900',
    };
    const levelBg = LEVEL_BG[level] ?? 'bg-gray-400';

    // Determine inner node visual based on nodeType
    let nodeVisual: React.ReactNode;

    if (nodeType === 'number') {
      nodeVisual = (
        <div
          className={cn(
            'rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-white text-xs',
            sizeClass,
            levelBg
          )}
        >
          {roundDecimals(pollutantValue, 0)}
        </div>
      );
    } else if (nodeType === 'node') {
      nodeVisual = (
        <div
          className={cn('rounded-full border-2 border-white shadow-sm', sizeClass, levelBg)}
        />
      );
    } else {
      // Default: emoji/icon style
      nodeVisual = (
        <div
          className={cn(
            'rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-white overflow-visible',
            sizeClass,
            isInactive && 'opacity-60'
          )}
        >
          <IconComponent className={cn('text-gray-700', iconClass)} />
          {reading.status === 'inactive' && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gray-400 rounded-full border-2 border-white" />
          )}
        </div>
      );
    }

    return (
      <CustomTooltip
        data={reading}
        selectedPollutant={selectedPollutant}
        onTooltipAction={() => onClick?.(data)}
        onTooltipHoverChange={hovering => onHover?.(hovering ? data : null)}
        forceOpen={isTooltipOpen}
      >
        {/* 
          ⚠️ CRITICAL: Flat div, not a nested component.
          pointerEvents:'auto' ensures mapbox doesn't swallow events.
          position:relative is needed for the selection ring.
        */}
        <div
          role="button"
          tabIndex={0}
          aria-label={ariaLabel}
          className={cn(
            'relative select-none',
            'transition-transform duration-150',
            'hover:scale-110 active:scale-95',
            isHovered && 'scale-110',
            className
          )}
          style={NODE_BUTTON_STYLE}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Selection ring */}
          {isSelected && (
            <span className="absolute -inset-1.5 rounded-full border-2 border-blue-500 animate-pulse pointer-events-none" />
          )}
          {nodeVisual}
        </div>
      </CustomTooltip>
    );
  }

  return null;
};

/**
 * Optimized memo comparison — only re-render when visually relevant props change.
 * We intentionally skip re-render on callbacks (onClick/onHover) because they
 * are stable useCallback references from EnhancedMap.
 */
const areEqual = (prev: MapNodesProps, next: MapNodesProps): boolean =>
  prev.isSelected === next.isSelected &&
  prev.isHovered === next.isHovered &&
  prev.nodeType === next.nodeType &&
  prev.size === next.size &&
  prev.selectedPollutant === next.selectedPollutant &&
  prev.zoomLevel === next.zoomLevel &&
  prev.isTooltipOpen === next.isTooltipOpen &&
  prev.reading?.id === next.reading?.id &&
  prev.reading?.pm25Value === next.reading?.pm25Value &&
  prev.reading?.pm10Value === next.reading?.pm10Value &&
  prev.reading?.status === next.reading?.status &&
  prev.cluster?.id === next.cluster?.id &&
  prev.cluster?.pointCount === next.cluster?.pointCount;

export const MapNodes = React.memo(MapNodesComponent, areEqual);
MapNodes.displayName = 'MapNodes';
