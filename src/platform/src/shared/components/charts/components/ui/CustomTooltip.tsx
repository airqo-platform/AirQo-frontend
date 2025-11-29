'use client';

import React from 'react';
import { TooltipData } from '../../types';
import { cn } from '@/shared/lib/utils';
import { format, parseISO } from 'date-fns';
import { getAirQualityInfo } from '@/shared/utils/airQuality';

interface CustomTooltipProps extends TooltipData {
  className?: string;
  showAirQualityLevel?: boolean;
  frequency?: string;
  pollutant?: 'pm2_5' | 'pm10';
}

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
  pollutant = 'pm2_5',
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const primaryData = payload[0];
  const value = primaryData.value as number;
  const airQualityLevel = getAirQualityInfo(value, pollutant);

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
                <span className="text-xs font-medium">
                  {airQualityLevel.label}
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
  const airQualityInfo = getAirQualityInfo(value, 'pm2_5'); // This component could be enhanced to accept pollutant prop
  const Icon = airQualityInfo.icon;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{airQualityInfo.label}</span>
    </div>
  );
};
