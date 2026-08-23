'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import type { AqiConfig } from '@/shared/types/aqi';
import {
  getAirQualityColor,
  getAirQualityIcon,
  getAirQualityLabel,
  mapAqiCategoryToLevel,
} from '@/shared/utils/airQuality';

interface AqiCategoryBadgeProps {
  category?: string | null;
  aqiConfig?: AqiConfig | null;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

/**
 * Color-coded AQI category pill. Uses the live AQI configuration from
 * `/devices/aqi-ranges` so colors/labels stay aligned with the rest of Nexus.
 */
export const AqiCategoryBadge: React.FC<AqiCategoryBadgeProps> = ({
  category,
  aqiConfig,
  className,
  showIcon = false,
  compact = false,
}) => {
  const level = mapAqiCategoryToLevel(category ?? undefined);
  const color = getAirQualityColor(level, aqiConfig ?? null);
  const label = getAirQualityLabel(level, 'WHO', 'PM2.5', aqiConfig ?? null);
  const Icon = getAirQualityIcon(level);

  const isNoValue = level === 'no-value';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        isNoValue
          ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          : 'text-white',
        className
      )}
      style={isNoValue ? undefined : { backgroundColor: color || '#6B7280' }}
      title={isNoValue ? 'No data' : label}
    >
      {showIcon && !isNoValue && <Icon className="h-3 w-3" />}
      {isNoValue ? 'No data' : label}
    </span>
  );
};

export default AqiCategoryBadge;
