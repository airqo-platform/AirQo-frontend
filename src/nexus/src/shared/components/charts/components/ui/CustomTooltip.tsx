'use client';

import React from 'react';
import { TooltipData } from '../../types';
import { cn } from '@/shared/lib/utils';
import { format, parseISO } from 'date-fns';
import { getAirQualityInfo } from '@/shared/utils/airQuality';
import { getChartLocationDisplayName } from '../../utils';
import type { AqiConfig } from '@/shared/types/aqi';

interface CustomTooltipProps extends TooltipData {
  className?: string;
  showAirQualityLevel?: boolean;
  frequency?: string;
  pollutant?: 'pm2_5' | 'pm10';
  aqiConfig?: AqiConfig | null;
  /**
   * Display-label overrides keyed by series dataKey (the picker's names).
   */
  seriesLabels?: Record<string, string>;
  /**
   * Display-label overrides keyed by site_id (the picker's names) — used on
   * the "Location:" line so it matches what the user selected.
   */
  locationLabels?: Record<string, string>;
  /**
   * When set, only entries of this series are shown — hover focus mode.
   * The rest of the chart is blurred in DynamicChart to match.
   */
  focusedDataKey?: string | null;
  /**
   * Overrides the header date rendering (used when the x values are not ISO
   * timestamps, e.g. year buckets in the rankings history chart).
   */
  tooltipDateFormatter?: (label: string | number) => string;
}

const formatTooltipDate = (
  label: string | number,
  frequency?: string
): string => {
  try {
    const date = parseISO(String(label));
    if (frequency === 'raw' || frequency === 'hourly') {
      return format(date, 'MMM dd, yyyy HH:mm');
    }
    if (frequency === 'monthly') {
      // Month buckets parse to the 1st — the day is meaningless for a month
      // average, so drop it (mirrors the axis label).
      return format(date, 'MMM yyyy');
    }
    if (frequency === 'weekly') {
      return format(date, 'MMM dd, yyyy');
    }
    return format(date, 'MMM dd, yyyy');
  } catch {
    return String(label);
  }
};

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  className,
  showAirQualityLevel = true,
  frequency,
  pollutant = 'pm2_5',
  aqiConfig = null,
  focusedDataKey = null,
  seriesLabels,
  locationLabels,
  tooltipDateFormatter,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const visiblePayload = focusedDataKey
    ? payload.filter(entry => String(entry.dataKey) === focusedDataKey)
    : payload;

  if (visiblePayload.length === 0) {
    return null;
  }

  const primaryData = visiblePayload[0];
  const value = primaryData.value as number;
  const airQualityLevel = getAirQualityInfo(value, pollutant, 'WHO', aqiConfig);
  const locationName =
    locationLabels?.[String(primaryData.payload.site_id)] ??
    getChartLocationDisplayName(primaryData.payload);

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg shadow-lg p-3 max-w-xs break-words',
        className
      )}
      style={{ wordBreak: 'break-word', zIndex: 9999 }}
    >
      {/* Header with timestamp */}
      <div className="text-sm font-medium text-muted-foreground mb-2">
        {tooltipDateFormatter
          ? tooltipDateFormatter(label || '')
          : formatTooltipDate(label || '', frequency)}
      </div>

      {/* Data entries */}
      <div className="space-y-2">
        {/* Display-only list — no stable ID available */}
        {visiblePayload.map((entry, index) => (
          <div key={index} className="flex items-start justify-between gap-2">
            <div className="flex items-center space-x-2 min-w-0">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-foreground truncate max-w-[220px] block">
                {seriesLabels?.[String(entry.dataKey)] ??
                  String(entry.name || entry.dataKey || '').trim()}
              </span>
            </div>
            <div className="text-right ml-2 flex-shrink-0">
              <span className="text-sm text-foreground">
                {typeof entry.value === 'number'
                  ? `${entry.value.toFixed(1)} µg/m³`
                  : entry.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Air Quality Level (only for single value) */}
      {showAirQualityLevel &&
        visiblePayload.length === 1 &&
        typeof value === 'number' && (
          <div className="mt-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Air Quality:
              </span>
              <div className="flex items-center space-x-2">
                <airQualityLevel.icon className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {airQualityLevel.label}
                </span>
              </div>
            </div>
          </div>
        )}

      {/* Location info if available */}
      {locationName !== 'Unknown Location' && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Location:</span> {locationName}
          </div>
          {primaryData.payload?.device_id && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Device:</span>{' '}
              {primaryData.payload.device_id}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// WHO Air Quality Standards indicator
interface AirQualityIndicatorProps {
  value: number;
  className?: string;
}

export const AirQualityIndicator: React.FC<AirQualityIndicatorProps> = ({
  value,
  className,
}) => {
  const airQualityInfo = getAirQualityInfo(value, 'pm2_5'); // This component could be enhanced to accept pollutant prop
  const Icon = airQualityInfo.icon;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{airQualityInfo.label}</span>
    </div>
  );
};
