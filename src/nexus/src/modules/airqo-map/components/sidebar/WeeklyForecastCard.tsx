'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { getAirQualityInfo } from '@/shared/utils/airQuality';
import { useForecast, type ForecastMode } from '../../hooks/useForecast';
import { AqCloudOff } from '@airqo/icons-react';
import { LoadingSpinner } from '../../../../shared/components/ui/loading-spinner';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Tooltip } from 'flowbite-react';
import {
  resolveParsedNumber,
  type DailyForecastItem,
  type HourlyForecastItem,
} from '../../../../shared/types/api';

interface WeeklyForecastCardProps {
  siteId?: string;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function safeParseDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

function getDayLabel(value: string | undefined | null): string {
  const d = safeParseDate(value);
  if (!d) return '';
  return DAY_LABELS[d.getDay()];
}

function getDateNum(value: string | undefined | null): string {
  const d = safeParseDate(value);
  if (!d) return '--';
  return String(d.getDate());
}

function getFullDate(value: string | undefined | null): string {
  const d = safeParseDate(value);
  if (!d) return '';
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function getHourLabel(value: string | undefined | null): string {
  const d = safeParseDate(value);
  if (!d) return '--:--';
  return `${String(d.getHours()).padStart(2, '0')}:00`;
}

function getFullTime(value: string | undefined | null): string {
  const d = safeParseDate(value);
  if (!d) return '';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function getAqiBgClass(category: string | undefined): string {
  if (!category) return 'bg-gray-50 border-gray-200';
  const c = category.toLowerCase();
  if (c.includes('good')) return 'bg-green-50 border-green-200';
  if (c.includes('moderate')) return 'bg-yellow-50 border-yellow-200';
  if (c.includes('sensitive') || c.includes('usg'))
    return 'bg-orange-50 border-orange-200';
  if (c.includes('unhealthy') && !c.includes('very'))
    return 'bg-red-50 border-red-200';
  if (c.includes('very unhealthy')) return 'bg-purple-50 border-purple-200';
  if (c.includes('hazardous')) return 'bg-pink-50 border-pink-200';
  return 'bg-gray-50 border-gray-200';
}

// ── Tab selector ─────────────────────────────────────────────────────────────
const ModeTabs: React.FC<{
  active: ForecastMode;
  onChange: (m: ForecastMode) => void;
}> = ({ active, onChange }) => (
  <div className="flex gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
    {(['daily', 'hourly'] as const).map(m => (
      <button
        key={m}
        onClick={() => onChange(m)}
        className={cn(
          'flex-1 text-xs font-medium py-1.5 rounded-md transition-all duration-200 capitalize',
          active === m
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        )}
      >
        {m}
      </button>
    ))}
  </div>
);

// ── Daily forecast pill ──────────────────────────────────────────────────────
const DailyPill: React.FC<{
  item: DailyForecastItem;
  isToday: boolean;
}> = ({ item, isToday }) => {
  const pm25 = resolveParsedNumber(item.forecast?.pm2_5_mean);
  const pm25Low = resolveParsedNumber(item.forecast?.pm2_5_low);
  const pm25High = resolveParsedNumber(item.forecast?.pm2_5_high);
  const aqiCategory = item.aqi?.aqi_category ?? item.aqi?.label ?? '';
  const aqiLabel = item.aqi?.label ?? '';
  const trendMessage = item.aqi?.trend_message;
  const confidence = resolveParsedNumber(item.forecast?.forecast_confidence);
  const temp = resolveParsedNumber(item.met?.air_temperature);
  const humidity = resolveParsedNumber(item.met?.relative_humidity);

  const airInfo = getAirQualityInfo(pm25 ?? 0, 'pm2_5');
  const ForecastIcon = airInfo.icon;
  const bgClass = getAqiBgClass(aqiCategory || airInfo.label);

  const tooltipContent = (
    <div className="max-w-[220px] space-y-1.5 text-left">
      <p className="font-semibold text-white">{getFullDate(item.date)}</p>
      <p className="text-xs text-white">
        <span className="font-medium">AQI:</span> {aqiCategory || airInfo.label}
      </p>
      {aqiLabel && (
        <p className="text-xs leading-snug text-gray-200">{aqiLabel}</p>
      )}
      {pm25Low != null && pm25High != null && (
        <p className="text-xs text-white">
          <span className="font-medium">PM₂.₅:</span> {pm25Low.toFixed(1)} –{' '}
          {pm25High.toFixed(1)} µg/m³
        </p>
      )}
      {temp != null && (
        <p className="text-xs text-white">
          <span className="font-medium">Temp:</span> {temp.toFixed(0)}°C
        </p>
      )}
      {humidity != null && (
        <p className="text-xs text-white">
          <span className="font-medium">Humidity:</span> {humidity.toFixed(0)}%
        </p>
      )}
      {trendMessage && (
        <p className="text-xs italic text-gray-300">{trendMessage}</p>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent} placement="top">
      <div
        className={cn(
          'flex flex-col items-center rounded-xl py-2.5 px-2.5 min-w-[64px] border transition-all duration-200 flex-shrink-0 cursor-default',
          isToday
            ? 'bg-blue-600 border-blue-600 shadow-md'
            : cn(bgClass, 'hover:shadow-sm')
        )}
      >
        {/* Day name */}
        <span
          className={cn(
            'text-[11px] font-medium mb-0.5',
            isToday ? 'text-blue-100' : 'text-gray-500'
          )}
        >
          {getDayLabel(item.date)}
        </span>

        {/* Date number */}
        <span
          className={cn(
            'text-base font-bold mb-1',
            isToday ? 'text-white' : 'text-gray-900 dark:text-gray-100'
          )}
        >
          {getDateNum(item.date)}
        </span>

        {/* Icon */}
        <div className="flex items-center justify-center mb-1">
          <ForecastIcon className="w-5 h-5" />
        </div>

        {/* PM2.5 value */}
        <span
          className={cn(
            'text-[11px] font-semibold',
            isToday ? 'text-white' : 'text-gray-700'
          )}
        >
          {pm25 != null ? pm25.toFixed(1) : '--'}
        </span>

        {/* Confidence */}
        {confidence != null && (
          <span
            className={cn(
              'text-[9px] mt-0.5 px-1.5 py-0.5 rounded-full font-medium',
              isToday
                ? 'bg-blue-500 text-blue-100'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            )}
          >
            {confidence.toFixed(0)}%
          </span>
        )}
      </div>
    </Tooltip>
  );
};

// ── Hourly forecast pill ─────────────────────────────────────────────────────
const HourlyPill: React.FC<{
  item: HourlyForecastItem;
  isFirst: boolean;
}> = ({ item, isFirst }) => {
  const pm25 = resolveParsedNumber(item.forecast?.pm2_5_mean);
  const aqiCategory = item.aqi?.aqi_category ?? item.aqi?.label ?? '';
  const aqiLabel = item.aqi?.label ?? '';
  const trendMessage = item.aqi?.trend_message;
  const confidence = resolveParsedNumber(item.forecast?.forecast_confidence);
  const temp = resolveParsedNumber(item.met?.air_temperature);
  const humidity = resolveParsedNumber(item.met?.relative_humidity);

  const airInfo = getAirQualityInfo(pm25 ?? 0, 'pm2_5');
  const ForecastIcon = airInfo.icon;
  const bgClass = getAqiBgClass(aqiCategory || airInfo.label);

  const tooltipContent = (
    <div className="max-w-[220px] space-y-1.5 text-left">
      <p className="font-semibold text-white">{getFullTime(item.timestamp)}</p>
      <p className="text-xs text-white">
        <span className="font-medium">AQI:</span> {aqiCategory || airInfo.label}
      </p>
      {aqiLabel && (
        <p className="text-xs leading-snug text-gray-200">{aqiLabel}</p>
      )}
      <p className="text-xs text-white">
        <span className="font-medium">PM₂.₅:</span>{' '}
        {pm25 != null ? `${pm25.toFixed(1)} µg/m³` : '--'}
      </p>
      {temp != null && (
        <p className="text-xs text-white">
          <span className="font-medium">Temp:</span> {temp.toFixed(0)}°C
        </p>
      )}
      {humidity != null && (
        <p className="text-xs text-white">
          <span className="font-medium">Humidity:</span> {humidity.toFixed(0)}%
        </p>
      )}
      {trendMessage && (
        <p className="text-xs italic text-gray-300">{trendMessage}</p>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent} placement="top">
      <div
        className={cn(
          'flex flex-col items-center rounded-xl py-2 px-1.5 min-w-[52px] border transition-all duration-200 flex-shrink-0 cursor-default',
          isFirst
            ? 'bg-blue-600 border-blue-600 shadow-md'
            : cn(bgClass, 'hover:shadow-sm')
        )}
      >
        {/* Hour */}
        <span
          className={cn(
            'text-[10px] font-medium mb-0.5',
            isFirst ? 'text-blue-100' : 'text-gray-500'
          )}
        >
          {getHourLabel(item.timestamp)}
        </span>

        {/* Icon */}
        <div className="flex items-center justify-center mb-1">
          <ForecastIcon className="w-4 h-4" />
        </div>

        {/* PM2.5 */}
        <span
          className={cn(
            'text-[10px] font-semibold',
            isFirst ? 'text-white' : 'text-gray-700'
          )}
        >
          {pm25 != null ? pm25.toFixed(1) : '--'}
        </span>

        {/* Temp */}
        {temp != null && (
          <span
            className={cn(
              'text-[9px] mt-0.5',
              isFirst ? 'text-blue-100' : 'text-gray-500'
            )}
          >
            {temp.toFixed(0)}°C
          </span>
        )}

        {/* Humidity */}
        {humidity != null && (
          <span
            className={cn(
              'text-[9px]',
              isFirst ? 'text-blue-100' : 'text-gray-400'
            )}
          >
            {humidity.toFixed(0)}%
          </span>
        )}

        {/* Confidence */}
        {confidence != null && (
          <span
            className={cn(
              'text-[8px] mt-0.5 px-1 py-0.5 rounded-full font-medium',
              isFirst
                ? 'bg-blue-500 text-blue-100'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            )}
          >
            {confidence.toFixed(0)}%
          </span>
        )}
      </div>
    </Tooltip>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
export const WeeklyForecastCard: React.FC<WeeklyForecastCardProps> = ({
  siteId,
}) => {
  const [mode, setMode] = React.useState<ForecastMode>('daily');

  const { dailyItems, hourlyItems, isLoading, error } = useForecast({
    siteId,
    mode,
    enabled: !!siteId,
  });

  const activeItems = mode === 'daily' ? dailyItems : hourlyItems;
  const showEmpty = !isLoading && !error && activeItems.length === 0;

  return (
    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Air Quality Forecast
          </h3>
        </div>

        {/* Mode tabs */}
        <ModeTabs active={mode} onChange={setMode} />

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <LoadingSpinner size={20} />
            <span className="ml-2 text-sm text-gray-500">
              Loading forecast...
            </span>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AqCloudOff className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              Unable to load forecast data
            </p>
          </div>
        )}

        {/* Empty — mode-aware */}
        {showEmpty && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AqCloudOff className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No forecast data available</p>
          </div>
        )}

        {/* Daily view */}
        {!isLoading && !error && mode === 'daily' && dailyItems.length > 0 && (
          <div className="w-full overflow-x-auto overflow-y-hidden -mx-1 px-1">
            <div className="flex gap-2 min-w-max py-1">
              {dailyItems.slice(0, 7).map((item, idx) => (
                <DailyPill key={item.date} item={item} isToday={idx === 0} />
              ))}
            </div>
          </div>
        )}

        {/* Hourly view */}
        {!isLoading &&
          !error &&
          mode === 'hourly' &&
          hourlyItems.length > 0 && (
            <div className="w-full overflow-x-auto overflow-y-hidden -mx-1 px-1">
              <div className="flex gap-1.5 min-w-max py-1">
                {hourlyItems.slice(0, 24).map((item, idx) => (
                  <HourlyPill
                    key={item.timestamp}
                    item={item}
                    isFirst={idx === 0}
                  />
                ))}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
};
