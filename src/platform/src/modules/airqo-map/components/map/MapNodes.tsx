'use client';

import React from 'react';
import { cn, roundDecimals } from '@/shared/lib/utils';
import {
  getAirQualityLevel,
  getAirQualityIcon,
} from '@/shared/utils/airQuality';
import { CustomTooltip } from './CustomTooltip';
import type { PollutantType } from '@/shared/utils/airQuality';

// ─── Public types ──────────────────────────────────────────────────────────────

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
}

export interface ClusterData {
  id: string;
  longitude: number;
  latitude: number;
  pointCount: number;
  readings: AirQualityReading[];
  mostCommonLevel?: string;
}

// ─── Module-level constants (never recreated on re-render) ────────────────────

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

/**
 * Tailwind classes for AQI level backgrounds.
 * Defined at module scope so they are never re-allocated during render.
 */
const LEVEL_BG: Record<string, string> = {
  good: 'bg-green-500',
  moderate: 'bg-yellow-500',
  'unhealthy-sensitive-groups': 'bg-orange-500',
  unhealthy: 'bg-red-500',
  'very-unhealthy': 'bg-purple-500',
  hazardous: 'bg-red-900',
};

/**
 * Stable inline style for the clickable node wrapper.
 * Object defined at module scope — never triggers re-render via reference change.
 */
const NODE_BUTTON_STYLE: React.CSSProperties = {
  touchAction: 'manipulation',
  userSelect: 'none',
  pointerEvents: 'auto',
  cursor: 'pointer',
};

// ─── Props ─────────────────────────────────────────────────────────────────────

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
  /**
   * Rounded to the nearest integer for memo comparison — avoids glitching
   * caused by fractional zoom updates during smooth pan/zoom animations.
   */
  zoomLevel?: number;
  isTooltipOpen?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * MapNodes renders a single map marker — either a cluster pill or an
 * individual air-quality reading icon.
 *
 * KEY RULES to avoid glitching:
 * 1. Never define sub-components inside the render function (causes remount).
 * 2. Keep module-level constants out of render (stops allocation on re-render).
 * 3. Memo comparison must be correct — stale clusters were previously possible
 *    because areEqual ignored cluster.readings content changes.
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
  const data = (cluster ?? reading) as
    | AirQualityReading
    | ClusterData
    | undefined;

  if (!data) return null;

  // Stable inline event handlers — defined once per render of this node.
  // These are never passed down to child components so there is no prop-drilling concern.
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

  // ── Cluster ──────────────────────────────────────────────────────────────────
  if (isCluster && cluster) {
    const pollutantValues = cluster.readings
      .map(r => (selectedPollutant === 'pm2_5' ? r.pm25Value : r.pm10Value))
      .filter((v): v is number => v !== undefined && !isNaN(v));

    if (pollutantValues.length === 0) return null;

    const sortedValues = [...pollutantValues].sort((a, b) => a - b);
    const BestIcon = getAirQualityIcon(
      getAirQualityLevel(sortedValues[0], selectedPollutant)
    );
    const WorstIcon = getAirQualityIcon(
      getAirQualityLevel(
        sortedValues[sortedValues.length - 1],
        selectedPollutant
      )
    );

    // Use rounded zoom for styling decisions — avoids visual thrash during animations
    const isHighZoom = Math.round(zoomLevel) >= 12;
    const displayCount =
      cluster.pointCount > 2
        ? `+${cluster.pointCount - 2}`
        : cluster.pointCount;

    return (
      <CustomTooltip
        data={cluster}
        selectedPollutant={selectedPollutant}
        onTooltipAction={() => onClick?.(data)}
        onTooltipHoverChange={hovering => onHover?.(hovering ? data : null)}
      >
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

  // ── Individual node ───────────────────────────────────────────────────────────
  if (reading) {
    const pollutantValue =
      selectedPollutant === 'pm2_5' ? reading.pm25Value : reading.pm10Value;
    const level = getAirQualityLevel(pollutantValue, selectedPollutant);
    const IconComponent = getAirQualityIcon(level);
    const sizeClass = SIZE_CLASSES[size];
    const iconClass = ICON_CLASSES[size];
    const levelBg = LEVEL_BG[level] ?? 'bg-gray-400';

    const ariaLabel = `Air quality: ${roundDecimals(pollutantValue, 1)} ${
      selectedPollutant === 'pm2_5' ? 'PM2.5' : 'PM10'
    } µg/m³ at ${reading.locationName ?? 'Unknown location'}. Click to view details.`;

    let nodeVisual: React.ReactNode;

    if (nodeType === 'number') {
      nodeVisual = (
        <div
          className={cn(
            'rounded-full border-2 border-white shadow-sm',
            'flex items-center justify-center font-bold text-white text-xs',
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
          className={cn(
            'rounded-full border-2 border-white shadow-sm',
            sizeClass,
            levelBg
          )}
        />
      );
    } else {
      // Default: emoji / icon style
      nodeVisual = (
        <div
          className={cn(
            'rounded-full border-2 border-white shadow-sm',
            'flex items-center justify-center bg-white overflow-visible',
            sizeClass
          )}
        >
          <IconComponent className={cn('text-gray-700', iconClass)} />
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
          {/* Selection ring — pointer-events:none so it never intercepts clicks */}
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

// ─── Memo equality ─────────────────────────────────────────────────────────────

/**
 * Cluster readings content fingerprint — detects changes in pm2.5/pm10 values
 * even when the cluster ID and point count are unchanged.
 *
 * We compute a cheap numeric sum of pollutant values rather than doing a deep
 * comparison or JSON serialisation; this is O(n) but avoids allocation.
 */
const clusterReadingsFingerprint = (readings: AirQualityReading[]): number => {
  let sum = 0;
  for (const r of readings) {
    // XOR-accumulate IDs' char codes for a fast structural check
    sum += (r.pm25Value ?? 0) + (r.pm10Value ?? 0);
  }
  return sum;
};

/**
 * Custom memo comparator for MapNodes.
 *
 * We skip re-render on callback prop changes (onClick/onHover) because those
 * are stable useCallback references from EnhancedMap — including them would
 * defeat memoisation entirely.
 *
 * FIX (CodeRabbit review): cluster.readings content is now checked via a
 * lightweight fingerprint so that updated pollutant values with unchanged
 * member IDs correctly invalidate the memo and trigger a re-render.
 *
 * FIX (glitching): zoomLevel is compared as Math.round() so fractional zoom
 * changes during smooth pan/zoom animations don't cause constant re-renders.
 */
const areEqual = (prev: MapNodesProps, next: MapNodesProps): boolean => {
  // Shared visual state
  if (
    prev.isSelected !== next.isSelected ||
    prev.isHovered !== next.isHovered ||
    prev.nodeType !== next.nodeType ||
    prev.size !== next.size ||
    prev.selectedPollutant !== next.selectedPollutant ||
    prev.isTooltipOpen !== next.isTooltipOpen
  )
    return false;

  // Round zoom for comparison — prevents glitch-re-renders during smooth animation
  if (Math.round(prev.zoomLevel ?? 10) !== Math.round(next.zoomLevel ?? 10))
    return false;

  // Individual reading checks
  if (
    prev.reading?.id !== next.reading?.id ||
    prev.reading?.pm25Value !== next.reading?.pm25Value ||
    prev.reading?.pm10Value !== next.reading?.pm10Value ||
    prev.reading?.status !== next.reading?.status
  )
    return false;

  // Cluster structural checks
  if (
    prev.cluster?.id !== next.cluster?.id ||
    prev.cluster?.pointCount !== next.cluster?.pointCount
  )
    return false;

  // FIX: Check cluster readings content so stale pollutant values are detected.
  // Only run when both sides have readings (cluster identity already matched above).
  if (prev.cluster?.readings && next.cluster?.readings) {
    if (prev.cluster.readings.length !== next.cluster.readings.length)
      return false;
    if (
      clusterReadingsFingerprint(prev.cluster.readings) !==
      clusterReadingsFingerprint(next.cluster.readings)
    )
      return false;
  }

  return true;
};

export const MapNodes = React.memo(MapNodesComponent, areEqual);
MapNodes.displayName = 'MapNodes';
