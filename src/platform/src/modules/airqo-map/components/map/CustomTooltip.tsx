'use client';

import React from 'react';
import { Tooltip } from 'flowbite-react';
import { cn, formatRoundedNumber } from '@/shared/lib/utils';
import {
  getAirQualityLevel,
  getAirQualityIcon,
  getAirQualityColor,
  getAirQualityLabel,
  getPollutantLabel,
} from '@/shared/utils/airQuality';
import type { AirQualityReading, ClusterData } from './MapNodes';
import type { PollutantType } from '@/shared/utils/airQuality';
import { getMonitorMetadata } from '@/modules/airqo-map/utils/monitorMetadata';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomTooltipProps {
  data: AirQualityReading | ClusterData | null;
  /** Must be a single ReactElement — Flowbite Tooltip requires it */
  children: React.ReactElement;
  className?: string;
  selectedPollutant?: PollutantType;
  onTooltipAction?: (data: AirQualityReading | ClusterData) => void;
  onTooltipHoverChange?: (isHovering: boolean) => void;
  showZoomHint?: boolean;
  /** When true, renders a pinned bubble above the node (post-click) */
  forceOpen?: boolean;
}

// ─── Pure helpers (defined at module scope — never recreated) ─────────────────

const formatValue = (value: number): string => formatRoundedNumber(value, 1);

const formatDate = (date: Date | string): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return 'Invalid date';
  }
};

// ─── Tooltip content builders ─────────────────────────────────────────────────

const ClusterTooltipContent: React.FC<{
  cluster: ClusterData;
  selectedPollutant: PollutantType;
  onTooltipAction?: (data: ClusterData) => void;
}> = ({ cluster, selectedPollutant, onTooltipAction }) => {
  const validReadings = cluster.readings.filter(r => {
    const val = selectedPollutant === 'pm2_5' ? r.pm25Value : r.pm10Value;
    return val !== undefined && !isNaN(val);
  });

  if (validReadings.length === 0) {
    return (
      <div className="p-2 min-w-[250px] max-w-[350px]">
        <div className="text-xs text-gray-500 mb-1">
          {formatDate(new Date())}
        </div>
        <div className="font-medium text-gray-900 text-sm mb-2">
          Cluster ({cluster.pointCount} stations)
        </div>
        <div className="text-sm text-gray-500">
          No data available for {getPollutantLabel(selectedPollutant)}
        </div>
      </div>
    );
  }

  const avgValue =
    validReadings.reduce((sum, r) => {
      const val = selectedPollutant === 'pm2_5' ? r.pm25Value : r.pm10Value;
      return sum + val;
    }, 0) / validReadings.length;

  const level = getAirQualityLevel(avgValue, selectedPollutant);
  const IconComponent = getAirQualityIcon(level);
  const color = getAirQualityColor(level);
  const label = getAirQualityLabel(level);

  return (
    <div className="p-2 min-w-[250px] max-w-[350px]">
      <div className="text-xs text-gray-500 mb-1">{formatDate(new Date())}</div>
      <div className="font-medium text-gray-900 text-sm mb-2">
        Cluster ({cluster.pointCount} stations)
      </div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm font-medium" style={{ color }}>
            {label}
          </div>
          <div className="text-sm text-gray-900">
            {formatValue(avgValue)} µg/m³ {getPollutantLabel(selectedPollutant)}
          </div>
        </div>
        <IconComponent className="w-9 h-9 flex-shrink-0" />
      </div>
      <div className="pt-2 border-t border-gray-100">
        {onTooltipAction ? (
          // pointer-events-auto is correct here — this is a real interactive button
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline pointer-events-auto"
            onClick={e => {
              e.stopPropagation();
              onTooltipAction(cluster);
            }}
          >
            Click to zoom in and view node details
          </button>
        ) : (
          <div className="text-xs text-gray-500">Click to zoom in</div>
        )}
      </div>
    </div>
  );
};

const ReadingTooltipContent: React.FC<{
  reading: AirQualityReading;
  selectedPollutant: PollutantType;
  showZoomHint: boolean;
  onTooltipAction?: (data: AirQualityReading) => void;
}> = ({ reading, selectedPollutant, showZoomHint, onTooltipAction }) => {
  const pollutantValue =
    selectedPollutant === 'pm2_5' ? reading.pm25Value : reading.pm10Value;

  if (pollutantValue === undefined || isNaN(pollutantValue)) {
    return (
      <div className="p-2 min-w-[250px] max-w-[350px]">
        <div className="text-xs text-gray-500 mb-1">
          {formatDate(reading.lastUpdated)}
        </div>
        <div className="font-medium text-gray-900 text-sm mb-2">
          {reading.locationName ?? 'Air Quality Station'}
        </div>
        <div className="text-sm text-gray-500">
          No data available for {getPollutantLabel(selectedPollutant)}
        </div>
      </div>
    );
  }

  const level = getAirQualityLevel(pollutantValue, selectedPollutant);
  const IconComponent = getAirQualityIcon(level);
  const color = getAirQualityColor(level);
  const label = getAirQualityLabel(level);
  const meta = getMonitorMetadata(reading);

  return (
    <div className="p-2 min-w-[250px] max-w-[350px]">
      <div className="text-xs text-gray-500 mb-1">
        {formatDate(reading.lastUpdated)}
      </div>
      <div className="font-medium text-gray-900 text-sm mb-2">
        {reading.locationName ?? 'Air Quality Station'}
      </div>

      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm font-medium" style={{ color }}>
            {label}
          </div>
          <div className="text-sm text-gray-900">
            {formatValue(pollutantValue)} µg/m³{' '}
            {getPollutantLabel(selectedPollutant)}
          </div>
        </div>
        <div style={{ color }}>
          <IconComponent className="w-9 h-9" />
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100 space-y-2">
        <div className="text-xs text-gray-500">Source: {meta.provider}</div>

        {(meta.primaryCategory || meta.deploymentCategory) && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-gray-100 bg-gray-50 px-2 py-1">
              <div className="text-[10px] uppercase tracking-wide text-gray-500">
                Category
              </div>
              <div className="text-xs font-semibold text-gray-800">
                {meta?.primaryCategory ?? '--'}
              </div>
            </div>
            <div className="rounded-md border border-gray-100 bg-gray-50 px-2 py-1">
              <div className="text-[10px] uppercase tracking-wide text-gray-500">
                Deployment
              </div>
              <div className="text-xs font-semibold text-gray-800">
                {meta.deploymentCategory ?? '--'}
              </div>
            </div>
          </div>
        )}

        {showZoomHint && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">
            Nodes are close together here. Zoom in to view exact node details.
          </div>
        )}

        {onTooltipAction && (
          // pointer-events-auto is correct here — this is a real interactive button
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline pointer-events-auto"
            onClick={e => {
              e.stopPropagation();
              onTooltipAction(reading);
            }}
          >
            Click node for more information
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * CustomTooltip — wraps a map node with hover or pinned tooltips.
 *
 * POINTER-EVENTS DESIGN:
 * ─────────────────────────────────────────────────────────────────────────────
 * In forceOpen (pinned) mode the tooltip bubble is layered above the node.
 * To prevent ANY part of the bubble from blocking map/marker clicks:
 *
 *   • The outermost bubble container → pointer-events: none      (transparent)
 *   • The inner content wrapper      → pointer-events: none      (transparent)
 *   • Individual interactive buttons → pointer-events: auto      (clickable)
 *
 * This means only the actual <button> elements in tooltipContent are
 * interactive; all non-interactive tooltip text/icons are invisible to clicks.
 *
 * In hover mode the Flowbite Tooltip handles its own pointer events correctly.
 */
export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  data,
  children,
  className,
  selectedPollutant = 'pm2_5',
  onTooltipAction,
  onTooltipHoverChange,
  showZoomHint = false,
  forceOpen = false,
}) => {
  if (!data) return children;

  const isCluster = 'readings' in data && 'pointCount' in data;

  const tooltipContent = isCluster ? (
    <ClusterTooltipContent
      cluster={data as ClusterData}
      selectedPollutant={selectedPollutant}
      onTooltipAction={
        onTooltipAction as ((d: ClusterData) => void) | undefined
      }
    />
  ) : (
    <ReadingTooltipContent
      reading={data as AirQualityReading}
      selectedPollutant={selectedPollutant}
      showZoomHint={showZoomHint}
      onTooltipAction={
        onTooltipAction as ((d: AirQualityReading) => void) | undefined
      }
    />
  );

  // ── Pinned (post-click) mode ────────────────────────────────────────────────
  if (forceOpen) {
    return (
      <div
        className={cn(
          'relative inline-flex items-center justify-center',
          className
        )}
        onMouseEnter={() => onTooltipHoverChange?.(true)}
        onMouseLeave={() => onTooltipHoverChange?.(false)}
      >
        {children}

        {/*
         * FIX (CodeRabbit review):
         * Both the outer container AND the inner content div use pointer-events-none.
         * Only explicit <button> elements inside tooltipContent re-enable pointer-events-auto.
         * This ensures the non-interactive bubble area never blocks map/node clicks.
         */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-[9999] pointer-events-none"
          role="tooltip"
        >
          {/* Inner content — also pointer-events-none; buttons re-enable individually */}
          <div className="rounded-lg border border-gray-200 bg-white text-gray-900 shadow-lg pointer-events-none">
            {tooltipContent}
          </div>
        </div>
      </div>
    );
  }

  // ── Hover mode ──────────────────────────────────────────────────────────────
  return (
    <Tooltip
      content={tooltipContent}
      placement="top"
      style="light"
      onMouseEnter={() => onTooltipHoverChange?.(true)}
      onMouseLeave={() => onTooltipHoverChange?.(false)}
      className={cn('z-[9999]', className)}
      trigger="hover"
      arrow
      animation="duration-150"
    >
      {children}
    </Tooltip>
  );
};
