'use client';

import React, { useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/components/ui/card';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { AqCloudOff } from '@airqo/icons-react';
import { Tooltip } from 'flowbite-react';
import { useForecast, type ForecastMode } from '@/modules/airqo-map/hooks';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import {
  getAirQualityInfo,
  getAirQualityColor,
} from '@/shared/utils/airQuality';
import { resolveParsedNumber } from '@/shared/types/api';
import type { DailyForecastItem, HourlyForecastItem } from '@/shared/types/api';

interface SiteForecastCardProps {
  siteId: string;
  siteName?: string;
  className?: string;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parseDate = (value: string | undefined | null): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const dayLabel = (value: string | undefined | null): string => {
  const d = parseDate(value);
  return d ? DAY_LABELS[d.getDay()] : '';
};

const dateLabel = (value: string | undefined | null): string => {
  const d = parseDate(value);
  return d
    ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
};

const hourLabel = (value: string | undefined | null): string => {
  const d = parseDate(value);
  return d ? `${String(d.getHours()).padStart(2, '0')}:00` : '--:--';
};

const MODE_OPTIONS: { value: ForecastMode; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
];

/**
 * Air quality forecast — IQAir-inspired design with:
 * - Hourly: horizontally scrollable card row, "Now" highlighted, each card
 *   shows time + AQI value + category color + temp
 * - Daily: 7-day horizontal card row with day name, AQI value, category color,
 *   temp range, and weather indicator
 * - Trust signals: "Issued at" timestamp, dominant pollutant label
 */
export const SiteForecastCard: React.FC<SiteForecastCardProps> = ({
  siteId,
  siteName,
  className,
}) => {
  const [mode, setMode] = React.useState<ForecastMode>('hourly');
  const { config: pm25AqiConfig } = useAqiConfig('pm2_5');

  const { dailyItems, hourlyItems, isLoading, error } = useForecast({
    siteId,
    mode,
    enabled: !!siteId,
  });

  const showEmpty =
    !isLoading &&
    !error &&
    (mode === 'hourly' ? hourlyItems.length === 0 : dailyItems.length === 0);

  const hourly = useMemo(() => hourlyItems.slice(0, 24), [hourlyItems]);
  const daily = useMemo(() => dailyItems.slice(0, 7), [dailyItems]);

  // Issuance timestamp from the first item
  const issuedAt = useMemo(() => {
    const item = mode === 'hourly' ? hourly[0] : daily[0];
    const createdAt = item?.created_at;
    if (!createdAt) return null;
    const d = parseDate(createdAt);
    return d
      ? d.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : null;
  }, [mode, hourly, daily]);

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="space-y-4 p-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              Air Quality Forecast
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {siteName
                ? `Predictions for ${siteName}`
                : 'Predicted air quality levels'}
            </p>
          </div>
          <SegmentedTabs
            ariaLabel="Forecast mode"
            size="sm"
            options={MODE_OPTIONS}
            value={mode}
            onChange={setMode}
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <LoadingSpinner size={18} /> Loading forecast…
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <AqCloudOff className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Unable to load forecast data
            </p>
          </div>
        )}

        {/* Empty */}
        {showEmpty && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <AqCloudOff className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No forecast data available for this location
            </p>
            <p className="text-xs text-muted-foreground">
              Forecast data is generated daily. Check back later.
            </p>
          </div>
        )}

        {/* Hourly view — scrollable card row */}
        {!isLoading && !error && mode === 'hourly' && hourly.length > 0 && (
          <div className="w-full overflow-x-auto -mx-1 px-1 pb-1">
            <div className="flex gap-2 min-w-max py-1">
              {hourly.map((item, idx) => (
                <HourlyCard
                  key={item.timestamp ?? idx}
                  item={item}
                  isNow={idx === 0}
                  aqiConfig={pm25AqiConfig}
                />
              ))}
            </div>
          </div>
        )}

        {/* Daily view — card row */}
        {!isLoading && !error && mode === 'daily' && daily.length > 0 && (
          <div className="w-full overflow-x-auto -mx-1 px-1 pb-1">
            <div className="flex gap-3 min-w-max py-1">
              {daily.map((item, idx) => (
                <DailyCard
                  key={item.date ?? idx}
                  item={item}
                  isToday={idx === 0}
                  aqiConfig={pm25AqiConfig}
                />
              ))}
            </div>
          </div>
        )}

        {/* Trust signal: issuance time */}
        {issuedAt && !isLoading && !error && (
          <p className="text-[11px] text-muted-foreground">
            Issued {issuedAt} · PM₂.₅ forecast
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// ── Hourly card ──────────────────────────────────────────────────────────────

interface HourlyCardProps {
  item: HourlyForecastItem;
  isNow: boolean;
  aqiConfig: ReturnType<typeof useAqiConfig>['config'];
}

const HourlyCard: React.FC<HourlyCardProps> = ({ item, isNow, aqiConfig }) => {
  const pm25 = resolveParsedNumber(item.forecast?.pm2_5_mean);
  const temp = resolveParsedNumber(item.met?.air_temperature);
  const aqiLabel = item.aqi?.label ?? '';

  const airInfo = getAirQualityInfo(pm25, 'pm2_5', 'WHO', aqiConfig ?? null);
  const color = getAirQualityColor(airInfo.level, aqiConfig ?? null);
  const ForecastIcon = airInfo.icon;

  const tooltipContent = (
    <div className="max-w-[200px] space-y-1 text-left">
      <p className="font-semibold text-white">
        {isNow ? 'Now' : hourLabel(item.timestamp)}
      </p>
      {aqiLabel && <p className="text-xs text-gray-200">{aqiLabel}</p>}
      <p className="text-xs text-white">
        PM₂.₅: {pm25 != null ? `${pm25.toFixed(1)} µg/m³` : '--'}
      </p>
      {temp != null && (
        <p className="text-xs text-white">Temp: {temp.toFixed(0)}°C</p>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent} placement="top">
      <div
        className={cn(
          'flex flex-col items-center rounded-xl py-3 px-3 min-w-[72px] border transition-all duration-200 motion-reduce:transition-none flex-shrink-0 cursor-default',
          isNow
            ? 'bg-blue-600 border-blue-600 shadow-md'
            : 'hover:shadow-sm'
        )}
        style={
          isNow
            ? undefined
            : {
                backgroundColor: color ? `${color}15` : undefined,
                borderColor: color ? `${color}40` : undefined,
              }
        }
      >
        <span
          className={cn(
            'text-[11px] font-medium mb-1',
            isNow ? 'text-blue-100' : 'text-muted-foreground'
          )}
        >
          {isNow ? 'Now' : hourLabel(item.timestamp)}
        </span>
        <ForecastIcon
          className={cn(
            'h-5 w-5 mb-1',
            isNow ? 'text-blue-100' : 'text-foreground'
          )}
        />
        <span
          className={cn(
            'text-base font-bold tabular-nums',
            isNow ? 'text-white' : 'text-foreground'
          )}
        >
          {pm25 != null ? pm25.toFixed(0) : '--'}
        </span>
        <span
          className={cn(
            'text-[10px]',
            isNow ? 'text-blue-100' : 'text-muted-foreground'
          )}
        >
          µg/m³
        </span>
        {temp != null && (
          <span
            className={cn(
              'text-[10px] mt-0.5',
              isNow ? 'text-blue-100' : 'text-muted-foreground'
            )}
          >
            {temp.toFixed(0)}°C
          </span>
        )}
      </div>
    </Tooltip>
  );
};

// ── Daily card ───────────────────────────────────────────────────────────────

interface DailyCardProps {
  item: DailyForecastItem;
  isToday: boolean;
  aqiConfig: ReturnType<typeof useAqiConfig>['config'];
}

const DailyCard: React.FC<DailyCardProps> = ({ item, isToday, aqiConfig }) => {
  const pm25 = resolveParsedNumber(item.forecast?.pm2_5_mean);
  const temp = resolveParsedNumber(item.met?.air_temperature);
  const aqiLabel = item.aqi?.label ?? '';

  const airInfo = getAirQualityInfo(pm25, 'pm2_5', 'WHO', aqiConfig ?? null);
  const color = getAirQualityColor(airInfo.level, aqiConfig ?? null);
  const ForecastIcon = airInfo.icon;

  return (
    <Tooltip
      content={
        <div className="max-w-[200px] space-y-1 text-left">
          <p className="font-semibold text-white">
            {dayLabel(item.date)}, {dateLabel(item.date)}
          </p>
          {aqiLabel && <p className="text-xs text-gray-200">{aqiLabel}</p>}
          {temp != null && (
            <p className="text-xs text-white">Temp: {temp.toFixed(0)}°C</p>
          )}
        </div>
      }
      placement="top"
    >
      <div
        className={cn(
          'flex flex-col items-center rounded-xl py-3 px-3 min-w-[72px] border transition-all duration-200 motion-reduce:transition-none flex-shrink-0 cursor-default',
          isToday
            ? 'bg-blue-600 border-blue-600 shadow-md'
            : 'hover:shadow-sm'
        )}
        style={
          isToday
            ? undefined
            : {
                backgroundColor: color ? `${color}15` : undefined,
                borderColor: color ? `${color}40` : undefined,
              }
        }
      >
        <span
          className={cn(
            'text-[11px] font-medium mb-1',
            isToday ? 'text-blue-100' : 'text-muted-foreground'
          )}
        >
          {isToday ? 'Today' : dayLabel(item.date)}
        </span>
        <ForecastIcon
          className={cn(
            'h-5 w-5 mb-1',
            isToday ? 'text-blue-100' : 'text-foreground'
          )}
        />
        <span
          className={cn(
            'text-base font-bold tabular-nums',
            isToday ? 'text-white' : 'text-foreground'
          )}
        >
          {pm25 != null ? pm25.toFixed(0) : '--'}
        </span>
        <span
          className={cn(
            'text-[10px] mt-0.5',
            isToday ? 'text-blue-100' : 'text-muted-foreground'
          )}
        >
          µg/m³
        </span>
        {temp != null && (
          <span
            className={cn(
              'text-[10px] mt-0.5',
              isToday ? 'text-blue-100' : 'text-muted-foreground'
            )}
          >
            {temp.toFixed(0)}°C
          </span>
        )}
      </div>
    </Tooltip>
  );
};

export default SiteForecastCard;
