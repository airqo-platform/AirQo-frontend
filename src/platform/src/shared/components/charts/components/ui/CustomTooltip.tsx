'use client';

import React from 'react';
import { TooltipData } from '../../types';
import { cn } from '@/shared/lib/utils';
import { format, parseISO } from 'date-fns';
import { POLLUTANT_RANGES } from '../../constants';
import {
  AqGood,
  AqHazardous,
  AqModerate,
  AqUnhealthy,
  AqUnhealthyForSensitiveGroups,
  AqVeryUnhealthy,
} from '@airqo/icons-react';

interface CustomTooltipProps extends TooltipData {
  className?: string;
  showAirQualityLevel?: boolean;
  frequency?: string;
}

const getAirQualityLevel = (
  value: number,
  pollutant: 'pm2_5' | 'pm10' = 'pm2_5'
): {
  level: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
} => {
  const ranges = POLLUTANT_RANGES[pollutant];

  for (const range of ranges) {
    if (value >= range.limit) {
      // Map category names to display names and icons
      const categoryMappings: Record<
        string,
        {
          level: string;
          color: string;
          icon: React.ComponentType<{ className?: string }>;
        }
      > = {
        GoodAir: { level: 'Good', color: '#10B981', icon: AqGood },
        ModerateAir: { level: 'Moderate', color: '#F59E0B', icon: AqModerate },
        UnhealthyForSensitiveGroups: {
          level: 'Unhealthy for Sensitive Groups',
          color: '#EF4444',
          icon: AqUnhealthyForSensitiveGroups,
        },
        Unhealthy: { level: 'Unhealthy', color: '#8B5CF6', icon: AqUnhealthy },
        VeryUnhealthy: {
          level: 'Very Unhealthy',
          color: '#DC2626',
          icon: AqVeryUnhealthy,
        },
        Hazardous: { level: 'Hazardous', color: '#7C2D12', icon: AqHazardous },
        Invalid: { level: 'Invalid', color: '#6B7280', icon: AqHazardous },
      };

      return (
        categoryMappings[range.category] || {
          level: 'Unknown',
          color: '#6B7280',
          icon: AqHazardous,
        }
      );
    }
  }

  return { level: 'Unknown', color: '#6B7280', icon: AqHazardous };
};

const formatTooltipDate = (
  label: string | number,
  frequency?: string
): string => {
  try {
    const date = parseISO(String(label));
    // Show time only for hourly/raw frequencies
    if (frequency === 'raw' || frequency === 'hourly') {
      return format(date, 'MMM dd, yyyy HH:mm');
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
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const primaryData = payload[0];
  const value = primaryData.value as number;
  const airQualityLevel = getAirQualityLevel(value, 'pm2_5'); // Default to PM2.5, can be enhanced later

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg shadow-lg p-3 max-w-xs break-words z-50',
        className
      )}
      style={{ wordBreak: 'break-word' }}
    >
      {/* Header with timestamp */}
      <div className="text-sm font-medium text-muted-foreground mb-2">
        {formatTooltipDate(label || '', frequency)}
      </div>

      {/* Data entries */}
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-start justify-between gap-2">
            <div className="flex items-center space-x-2 min-w-0">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-foreground truncate max-w-[220px] block">
                {String(entry.name || entry.dataKey || '').replace(/_/g, ' ')}
              </span>
            </div>
            <div className="text-right ml-2 flex-shrink-0">
              <span className="text-sm text-foreground">
                {typeof entry.value === 'number'
                  ? `${entry.value.toFixed(2)} µg/m³`
                  : entry.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Air Quality Level (only for single value) */}
      {showAirQualityLevel &&
        payload.length === 1 &&
        typeof value === 'number' && (
          <div className="mt-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Air Quality:
              </span>
              <div className="flex items-center space-x-2">
                <airQualityLevel.icon className="w-4 h-4" />
                <span
                  className="text-xs font-medium"
                  style={{ color: airQualityLevel.color }}
                >
                  {airQualityLevel.level}
                </span>
              </div>
            </div>
          </div>
        )}

      {/* Location info if available */}
      {primaryData.payload?.site && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Location:</span>{' '}
            {String(primaryData.payload.site || '').replace(/_/g, ' ')}
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
  const { level, color, icon: Icon } = getAirQualityLevel(value, 'pm2_5');

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium" style={{ color }}>
        {level}
      </span>
    </div>
  );
};
