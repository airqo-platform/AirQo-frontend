'use client';

import React from 'react';
import { Tooltip } from 'flowbite-react';
import { cn, formatRoundedNumber } from '@/shared/lib/utils';
import {
  getAirQualityIcon,
  getAirQualityColor,
  getAirQualityLabel,
  getPollutantLabel,
} from '@/shared/utils/airQuality';
import {
  getReadingAqiLevel,
  getClusterCategoryFallback,
} from '@/modules/airqo-map/utils/dataNormalization';
import type { AirQualityReading, ClusterData } from './MapNodes';
import type { PollutantType } from '@/shared/utils/airQuality';
import type { AqiConfig } from '@/shared/types/aqi';
import { getMonitorMetadata } from '@/modules/airqo-map/utils/monitorMetadata';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomTooltipProps {
  data: AirQualityReading | ClusterData | null;
  /** Must be a single ReactElement — Flowbite Tooltip requires it */
  children: React.ReactElement;
  className?: string;
  selectedPollutant?: PollutantType;
  aqiConfig?: AqiConfig | null;
  onTooltipAction?: (data: AirQualityReading | ClusterData) => void;
  onTooltipHoverChange?: (isHovering: boolean) => void;
  showZoomHint?: boolean;
  /** When true, renders a pinned bubble above the node (post-click) */
  forceOpen?: boolean;
  /** When false (mobile), hover tooltips are disabled — see MapNodes. */
  enableHoverTooltip?: boolean;
}

// ─── Pure helpers (defined at module scope — never recreated) ─────────────────

const formatValue = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '--';
  return formatRoundedNumber(value, 1);
};

const formatAqiIndex = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '--';
  return String(Math.round(value));
};

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

const getPollutantDisplayType = (
  selectedPollutant: PollutantType
): 'PM2.5' | 'PM10' => (selectedPollutant === 'pm10' ? 'PM10' : 'PM2.5');

// ─── Tooltip content builders ─────────────────────────────────────────────────

const ClusterTooltipContent: React.FC<{
  cluster: ClusterData;
  selectedPollutant: PollutantType;
  aqiConfig?: AqiConfig | null;
  onTooltipAction?: (data: ClusterData) => void;
}> = ({ cluster, selectedPollutant, aqiConfig, onTooltipAction }) => {
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

  const aqiValues = cluster.readings
    .map(r => r.aqiIndex)
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));
  const avgAqiIndex = aqiValues.length
    ? aqiValues.reduce((sum, v) => sum + v, 0) / aqiValues.length
    : undefined;

  const level = getReadingAqiLevel(
    {
      pm25Value: avgValue,
      pm10Value: avgValue,
      aqiCategory: getClusterCategoryFallback(cluster.readings),
    },
    selectedPollutant,
    aqiConfig
  );
  const IconComponent = getAirQualityIcon(level);
  const color = getAirQualityColor(level, aqiConfig);
  const label = getAirQualityLabel(
    level,
    'WHO',
    getPollutantDisplayType(selectedPollutant),
    aqiConfig
  );

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
          <div className="text-2xl font-bold" style={{ color }}>
            AQI {formatAqiIndex(avgAqiIndex)}
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
  aqiConfig?: AqiConfig | null;
  showZoomHint: boolean;
  onTooltipAction?: (data: AirQualityReading) => void;
}> = ({
  reading,
  selectedPollutant,
  aqiConfig,
  showZoomHint,
  onTooltipAction,
}) => {
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

  const level = getReadingAqiLevel(reading, selectedPollutant, aqiConfig);
  const IconComponent = getAirQualityIcon(level);
  const color = getAirQualityColor(level, aqiConfig);
  const label = getAirQualityLabel(
    level,
    'WHO',
    getPollutantDisplayType(selectedPollutant),
    aqiConfig
  );
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
          <div className="text-2xl font-bold leading-tight" style={{ color }}>
            AQI {formatAqiIndex(reading.aqiIndex)}
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

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="rounded-md border border-gray-100 bg-gray-50 px-2 py-1">
          <div className="text-[10px] uppercase tracking-wide text-gray-500">
            PM2.5
          </div>
          <div className="text-xs font-semibold text-gray-800">
            {formatValue(reading.pm25Value)} µg/m³
          </div>
        </div>
        <div className="rounded-md border border-gray-100 bg-gray-50 px-2 py-1">
          <div className="text-[10px] uppercase tracking-wide text-gray-500">
            PM10
          </div>
          <div className="text-xs font-semibold text-gray-800">
            {formatValue(reading.pm10Value)} µg/m³
          </div>
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

// ─── Compact (mobile) tooltip content ────────────────────────────────────────
// On small screens the pinned tooltip must stay small so it never covers the
// top-left filter controls. It shows the essentials; the details panel below
// the map carries the full information.

const CompactReadingTooltipContent: React.FC<{
  reading: AirQualityReading;
  selectedPollutant: PollutantType;
  aqiConfig?: AqiConfig | null;
}> = ({ reading, selectedPollutant, aqiConfig }) => {
  const pollutantValue =
    selectedPollutant === 'pm2_5' ? reading.pm25Value : reading.pm10Value;

  const level = getReadingAqiLevel(reading, selectedPollutant, aqiConfig);
  const IconComponent = getAirQualityIcon(level);
  const color = getAirQualityColor(level, aqiConfig);

  return (
    <div className="px-3 py-2 min-w-[180px] max-w-[240px]">
      <div className="flex items-center gap-2">
        <div style={{ color }} className="flex-none">
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="font-medium text-gray-900 text-sm leading-tight truncate">
            {reading.locationName ?? 'Air Quality Station'}
          </div>
          <div className="text-sm" style={{ color }}>
            AQI {formatAqiIndex(reading.aqiIndex)}
            {pollutantValue !== undefined && !isNaN(pollutantValue)
              ? ` · ${formatValue(pollutantValue)} µg/m³`
              : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

const CompactClusterTooltipContent: React.FC<{
  cluster: ClusterData;
  selectedPollutant: PollutantType;
  aqiConfig?: AqiConfig | null;
}> = ({ cluster, selectedPollutant, aqiConfig }) => {
  const validReadings = cluster.readings.filter(r => {
    const val = selectedPollutant === 'pm2_5' ? r.pm25Value : r.pm10Value;
    return val !== undefined && !isNaN(val);
  });

  const avgValue = validReadings.length
    ? validReadings.reduce((sum, r) => {
        const val = selectedPollutant === 'pm2_5' ? r.pm25Value : r.pm10Value;
        return sum + (val as number);
      }, 0) / validReadings.length
    : 0;

  const aqiValues = cluster.readings
    .map(r => r.aqiIndex)
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));
  const avgAqiIndex = aqiValues.length
    ? aqiValues.reduce((sum, v) => sum + v, 0) / aqiValues.length
    : undefined;

  const hasData = validReadings.length > 0;

  const level = getReadingAqiLevel(
    {
      pm25Value: avgValue,
      pm10Value: avgValue,
      aqiCategory: getClusterCategoryFallback(cluster.readings),
    },
    selectedPollutant,
    aqiConfig
  );
  const IconComponent = getAirQualityIcon(level);
  const color = getAirQualityColor(level, aqiConfig);

  return (
    <div className="px-3 py-2 min-w-[180px] max-w-[240px]">
      <div className="flex items-center gap-2">
        <div style={{ color }} className="flex-none">
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="font-medium text-gray-900 text-sm leading-tight truncate">
            Cluster ({cluster.pointCount} stations)
          </div>
          <div className="text-sm" style={{ color }}>
            AQI {formatAqiIndex(hasData ? avgAqiIndex : undefined)}
            {hasData && avgValue > 0
              ? ` · ${formatValue(avgValue)} µg/m³`
              : ' · No data for selected pollutant'}
          </div>
        </div>
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
  aqiConfig = null,
  onTooltipAction,
  onTooltipHoverChange,
  showZoomHint = false,
  forceOpen = false,
  enableHoverTooltip = true,
}) => {
  if (!data) return children;

  const isCluster = 'readings' in data && 'pointCount' in data;

  const tooltipContent = isCluster ? (
    <ClusterTooltipContent
      cluster={data as ClusterData}
      selectedPollutant={selectedPollutant}
      aqiConfig={aqiConfig}
      onTooltipAction={
        onTooltipAction as ((d: ClusterData) => void) | undefined
      }
    />
  ) : (
    <ReadingTooltipContent
      reading={data as AirQualityReading}
      selectedPollutant={selectedPollutant}
      aqiConfig={aqiConfig}
      showZoomHint={showZoomHint}
      onTooltipAction={
        onTooltipAction as ((d: AirQualityReading) => void) | undefined
      }
    />
  );

  // ── Pinned (post-click) mode ────────────────────────────────────────────────
  if (forceOpen) {
    const compactContent = isCluster ? (
      <CompactClusterTooltipContent
        cluster={data as ClusterData}
        selectedPollutant={selectedPollutant}
        aqiConfig={aqiConfig}
      />
    ) : (
      <CompactReadingTooltipContent
        reading={data as AirQualityReading}
        selectedPollutant={selectedPollutant}
        aqiConfig={aqiConfig}
      />
    );

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

        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 md:top-auto md:bottom-full md:mb-2 z-[9999] pointer-events-none max-w-[calc(100vw-2rem)]"
          role="tooltip"
        >
          {/* Inner content — also pointer-events-none; buttons re-enable individually */}
          <div className="rounded-lg border border-gray-200 bg-white text-gray-900 shadow-lg pointer-events-none">
            {/*
             * CSS-only responsive switch (no JS media query — CustomTooltip is
             * rendered once per map marker and hook-driven subscriptions would
             * trigger setState-during-render):
             *   - < 768px (md down): compact bubble below the node — never
             *     covers the top filter/control clusters; full details live
             *     in the panel below the map.
             *   - ≥ 768px: full tooltip with PM/source/category breakdown.
             */}
            <div className="md:hidden">{compactContent}</div>
            <div className="hidden md:block">{tooltipContent}</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Hover mode ──────────────────────────────────────────────────────────────
  // Disabled on mobile: on touch, a tap fires mouseenter first and the
  // Flowbite hover tooltip (full-size content) would open over the filter
  // controls. Mobile users get the compact pinned bubble + details panel.
  if (!enableHoverTooltip) {
    return (
      <span
        onMouseEnter={() => onTooltipHoverChange?.(true)}
        onMouseLeave={() => onTooltipHoverChange?.(false)}
      >
        {children}
      </span>
    );
  }

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
