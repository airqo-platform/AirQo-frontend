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
  getAirQualityIcon,
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

/**
 * Wind direction as a simple arrow character from degrees.
 * 0°=N, 90°=E, 180°=S, 270°=W
 */
const windArrow = (degrees: number | undefined | null): string => {
  if (degrees == null) return '↑';
  const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
  const idx = Math.round(((degrees % 360 + 360) % 360) / 45) % 8;
  return arrows[idx];
};

const MODE_OPTIONS: { value: ForecastMode; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
];

/**
 * Air quality forecast — IQAir-inspired design with:
 * - Hourly: scrollable card row, "Now" highlighted, each card shows
 *   time + AQI value badge + weather emoji + temp + wind + humidity
 * - Daily: card row with day name, AQI value badge, weather emoji,
 *   temp range, wind speed, humidity
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
                ? `${siteName} air quality index (AQI) forecast`
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
// IQAir-inspired: time + AQI badge + weather emoji + temp + wind + humidity

interface HourlyCardProps {
  item: HourlyForecastItem;
  isNow: boolean;
  aqiConfig: ReturnType<typeof useAqiConfig>['config'];
}

const HourlyCard: React.FC<HourlyCardProps> = ({ item, isNow, aqiConfig }) => {
  const pm25 = resolveParsedNumber(item.forecast?.pm2_5_mean);
  const temp = resolveParsedNumber(item.met?.air_temperature);
  const humidity = resolveParsedNumber(item.met?.relative_humidity);
  const windSpeed = resolveParsedNumber(item.met?.wind_speed);
  const windDir = resolveParsedNumber(item.met?.wind_from_direction);
  const aqiLabel = item.aqi?.label ?? '';

  const airInfo = getAirQualityInfo(pm25, 'pm2_5', 'WHO', aqiConfig ?? null);
  const color = getAirQualityColor(airInfo.level, aqiConfig ?? null);
  const AqiIcon = getAirQualityIcon(airInfo.level);

  const tooltipContent = (
    <div className="max-w-[220px] space-y-1 text-left">
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
      {humidity != null && (
        <p className="text-xs text-white">Humidity: {humidity.toFixed(0)}%</p>
      )}
      {windSpeed != null && (
        <p className="text-xs text-white">
          Wind: {windSpeed.toFixed(0)} km/h {windArrow(windDir)}
        </p>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent} placement="top">
      <div
        className={cn(
          'flex flex-col items-center rounded-xl py-3 px-3 min-w-[80px] border transition-all duration-200 motion-reduce:transition-none flex-shrink-0 cursor-default',
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
        {/* Time */}
        <span
          className={cn(
            'text-[11px] font-medium mb-1',
            isNow ? 'text-blue-100' : 'text-muted-foreground'
          )}
        >
          {isNow ? 'Now' : hourLabel(item.timestamp)}
        </span>
        {/* AQI value badge */}
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums mb-1',
            isNow
              ? 'bg-white/20 text-white'
              : 'text-foreground'
          )}
          style={
            isNow
              ? undefined
              : { backgroundColor: color ? `${color}20` : undefined }
          }
        >
          {pm25 != null ? pm25.toFixed(0) : '--'}
        </span>
        {/* AQI level icon */}
        <span className="text-base mb-0.5" title={aqiLabel}>
          {React.createElement(AqiIcon, { className: 'w-5 h-5' })}
        </span>
        {/* Temperature */}
        {temp != null && (
          <span
            className={cn(
              'text-[11px] font-medium',
              isNow ? 'text-blue-100' : 'text-foreground'
            )}
          >
            {temp.toFixed(0)}°
          </span>
        )}
        {/* Wind */}
        {windSpeed != null && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-[10px]',
              isNow ? 'text-blue-100' : 'text-muted-foreground'
            )}
          >
            <span className="text-xs">{windArrow(windDir)}</span>
            <span>{windSpeed.toFixed(0)}</span>
            <span className="text-[8px]">km/h</span>
          </div>
        )}
        {/* Humidity */}
        {humidity != null && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-[10px]',
              isNow ? 'text-blue-100' : 'text-muted-foreground'
            )}
          >
            <span className="text-blue-400">💧</span>
            <span>{humidity.toFixed(0)}%</span>
          </div>
        )}
      </div>
    </Tooltip>
  );
};

// ── Daily card ───────────────────────────────────────────────────────────────
// IQAir-inspired: day + AQI badge + weather emoji + temp range + wind + humidity

interface DailyCardProps {
  item: DailyForecastItem;
  isToday: boolean;
  aqiConfig: ReturnType<typeof useAqiConfig>['config'];
}

const DailyCard: React.FC<DailyCardProps> = ({ item, isToday, aqiConfig }) => {
  const pm25 = resolveParsedNumber(item.forecast?.pm2_5_mean);
  const tempHigh = resolveParsedNumber(
    item.forecast?.pm2_5_high ?? item.met?.air_temperature
  );
  const tempLow = resolveParsedNumber(item.forecast?.pm2_5_min);
  const humidity = resolveParsedNumber(item.met?.relative_humidity);
  const windSpeed = resolveParsedNumber(item.met?.wind_speed);
  const windDir = resolveParsedNumber(item.met?.wind_from_direction);
  const aqiLabel = item.aqi?.label ?? '';

  const airInfo = getAirQualityInfo(pm25, 'pm2_5', 'WHO', aqiConfig ?? null);
  const color = getAirQualityColor(airInfo.level, aqiConfig ?? null);
  const AqiIcon = getAirQualityIcon(airInfo.level);

  return (
    <Tooltip
      content={
        <div className="max-w-[220px] space-y-1 text-left">
          <p className="font-semibold text-white">
            {dayLabel(item.date)}, {dateLabel(item.date)}
          </p>
          {aqiLabel && <p className="text-xs text-gray-200">{aqiLabel}</p>}
          {tempHigh != null && (
            <p className="text-xs text-white">High: {tempHigh.toFixed(0)}°C</p>
          )}
          {tempLow != null && (
            <p className="text-xs text-white">Low: {tempLow.toFixed(0)}°C</p>
          )}
          {humidity != null && (
            <p className="text-xs text-white">
              Humidity: {humidity.toFixed(0)}%
            </p>
          )}
          {windSpeed != null && (
            <p className="text-xs text-white">
              Wind: {windSpeed.toFixed(0)} km/h {windArrow(windDir)}
            </p>
          )}
        </div>
      }
      placement="top"
    >
      <div
        className={cn(
          'flex flex-col items-center rounded-xl py-3 px-3 min-w-[80px] border transition-all duration-200 motion-reduce:transition-none flex-shrink-0 cursor-default',
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
        {/* Day name */}
        <span
          className={cn(
            'text-[11px] font-medium mb-1',
            isToday ? 'text-blue-100' : 'text-muted-foreground'
          )}
        >
          {isToday ? 'Today' : dayLabel(item.date)}
        </span>
        {/* AQI value badge */}
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums mb-1',
            isToday
              ? 'bg-white/20 text-white'
              : 'text-foreground'
          )}
          style={
            isToday
              ? undefined
              : { backgroundColor: color ? `${color}20` : undefined }
          }
        >
          {pm25 != null ? pm25.toFixed(0) : '--'}
        </span>
        {/* AQI level icon */}
        <span className="text-base mb-0.5" title={aqiLabel}>
          {React.createElement(AqiIcon, { className: 'w-5 h-5' })}
        </span>
        {/* Temp high/low */}
        <div
          className={cn(
            'flex items-center gap-1 text-[11px] font-medium',
            isToday ? 'text-blue-100' : 'text-foreground'
          )}
        >
          {tempHigh != null && <span>{tempHigh.toFixed(0)}°</span>}
          {tempLow != null && (
            <span
              className={cn(
                isToday ? 'text-blue-200' : 'text-muted-foreground'
              )}
            >
              {tempLow.toFixed(0)}°
            </span>
          )}
        </div>
        {/* Wind */}
        {windSpeed != null && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-[10px]',
              isToday ? 'text-blue-100' : 'text-muted-foreground'
            )}
          >
            <span className="text-xs">{windArrow(windDir)}</span>
            <span>{windSpeed.toFixed(0)}</span>
            <span className="text-[8px]">km/h</span>
          </div>
        )}
        {/* Humidity */}
        {humidity != null && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-[10px]',
              isToday ? 'text-blue-100' : 'text-muted-foreground'
            )}
          >
            <span className="text-blue-400">💧</span>
            <span>{humidity.toFixed(0)}%</span>
          </div>
        )}
      </div>
    </Tooltip>
  );
};

export default SiteForecastCard;
