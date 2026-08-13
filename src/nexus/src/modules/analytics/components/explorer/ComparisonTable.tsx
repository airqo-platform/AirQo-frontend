'use client';

import React, { useMemo } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { AqArrowUp, AqArrowDown, AqRefreshCcw01 } from '@airqo/icons-react';
import { HiMinus } from 'react-icons/hi';
import {
  useComparisonReadings,
  extractReadingNames,
  resolveSiteName,
} from '../../hooks/useComparisonReadings';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { AqiLegend } from './AqiLegend';
import {
  getAirQualityColor,
  getAirQualityIcon,
  getAirQualityLabel,
  getAirQualityLevel,
  mapAqiCategoryToLevel,
} from '@/shared/utils/airQuality';
import type { AqiConfig } from '@/shared/types/aqi';
import type { RecentReading } from '@/shared/types/api';

interface ComparisonTableProps {
  siteIds: string[];
  siteNames: Map<string, string>;
  aqiConfig?: AqiConfig | null;
  /** Hydrates the page-level names map from readings (no raw ids shown) */
  onNamesResolved?: (names: Map<string, string>) => void;
  className?: string;
}

interface ComparisonRow {
  id: string;
  siteId: string;
  name: string;
  city: string;
  country: string;
  pm2_5: number | null;
  pm10: number | null;
  dailyAvg: number | null;
  category: string | null;
  percentageDifference: number | null;
  time: string | null;
  [key: string]: unknown;
}

const formatValue = (value: number | null): string => {
  if (value === null || typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }
  return value.toFixed(1);
};

const formatRelativeTime = (value: string | null): string => {
  if (!value) return '—';
  try {
    const parsed = parseISO(value);
    if (Number.isNaN(parsed.getTime())) return '—';
    return formatDistanceToNow(parsed, { addSuffix: true });
  } catch {
    return '—';
  }
};

/**
 * Comparison of the latest readings across every selected location —
 * deliberately unlimited, AirGradient-style. Built on the shared
 * ServerSideTable (search, sortable columns, pagination, standard states)
 * so it matches every other table in the app. PM2.5 and PM10 columns are
 * threshold-colored from the live AQI config, missing values render as a
 * dash, and each row carries the site's trend vs the previous reading.
 */
export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  siteIds,
  siteNames,
  aqiConfig,
  onNamesResolved,
  className,
}) => {
  const { data: readings, isLoading, isFetching, error, refetch } =
    useComparisonReadings(siteIds, true);

  const rows = useMemo<ComparisonRow[]>(() => {
    const readingsBySite = new Map<string, RecentReading>();
    (readings ?? []).forEach(reading => {
      const existing = readingsBySite.get(reading.site_id);
      if (
        !existing ||
        new Date(reading.time).getTime() > new Date(existing.time).getTime()
      ) {
        readingsBySite.set(reading.site_id, reading);
      }
      // Also index by device_id so device-selected charts resolve correctly —
      // the API receives device IDs as site_id params but returns the actual
      // site_id in the response body, so the lookup must cover both keys.
      if (reading.device_id) {
        const existingDevice = readingsBySite.get(reading.device_id);
        if (
          !existingDevice ||
          new Date(reading.time).getTime() >
            new Date(existingDevice.time).getTime()
        ) {
          readingsBySite.set(reading.device_id, reading);
        }
      }
    });

    return siteIds.map(siteId => {
      const reading = readingsBySite.get(siteId);
      const pm25 = reading?.pm2_5?.value ?? null;
      const pm10 = reading?.pm10?.value ?? null;
      const percentageDifference =
        typeof reading?.averages?.percentageDifference === 'number'
          ? reading.averages.percentageDifference
          : null;

      return {
        id: siteId,
        siteId,
        name:
          siteNames.get(siteId) ??
          resolveSiteName(reading?.siteDetails) ??
          'Unknown location',
        city: reading?.siteDetails?.city ?? '',
        country: reading?.siteDetails?.country ?? '',
        pm2_5: typeof pm25 === 'number' ? pm25 : null,
        pm10: typeof pm10 === 'number' ? pm10 : null,
        dailyAvg:
          typeof reading?.averages?.dailyAverage === 'number'
            ? reading.averages.dailyAverage
            : null,
        category: reading?.aqi_category ?? null,
        percentageDifference,
        time: reading?.time ?? null,
      };
    });
  }, [readings, siteIds, siteNames]);

  // Share the display names resolved from readings with the parent so the
  // forecast selector and chips never fall back to raw ids.
  React.useEffect(() => {
    if (!onNamesResolved || !readings) return;
    const names = extractReadingNames(readings);
    if (names.size > 0) onNamesResolved(names);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readings]);

  // Each pollutant column must be colored against ITS OWN AQI ranges —
  // pm2_5 and pm10 breakpoints differ (the legend uses the page-selected
  // pollutant, which only matches the pm2_5 column).
  const { config: pm25AqiConfig } = useAqiConfig('pm2_5');
  const { config: pm10AqiConfig } = useAqiConfig('pm10');

  const renderValue = (
    value: number | null,
    pollutant: 'pm2_5' | 'pm10'
  ) => {
    if (value === null) {
      return (
        <span className="text-gray-300 dark:text-gray-600" title="No data">
          —
        </span>
      );
    }
    const columnConfig = pollutant === 'pm10' ? pm10AqiConfig : pm25AqiConfig;
    const level = getAirQualityLevel(value, pollutant, columnConfig ?? null);
    const color = getAirQualityColor(level, columnConfig ?? null);
    return (
      <span className="inline-flex items-center gap-1.5 tabular-nums">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color || '#6B7280' }}
          aria-hidden
        />
        <span className="font-semibold text-foreground">
          {formatValue(value)}
        </span>
        <span className="text-xs text-muted-foreground">µg/m³</span>
      </span>
    );
  };

  const renderTrend = (percentageDifference: number | null) => {
    if (percentageDifference === null) {
      return <span className="text-gray-300 dark:text-gray-600">—</span>;
    }
    if (percentageDifference > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
          <AqArrowUp className="h-3.5 w-3.5" />
          {percentageDifference.toFixed(0)}%
        </span>
      );
    }
    if (percentageDifference < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-500">
          <AqArrowDown className="h-3.5 w-3.5" />
          {Math.abs(percentageDifference).toFixed(0)}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
        <HiMinus className="h-3.5 w-3.5" />
        Stable
      </span>
    );
  };

  const renderCategory = (category: string | null, pm25: number | null) => {
    // The badge reflects the PM2.5 reading (its own config) when available,
    // falling back to the API-provided category string.
    const level = mapAqiCategoryToLevel(category ?? undefined);
    const levelFromValue =
      pm25 !== null
        ? getAirQualityLevel(pm25, 'pm2_5', pm25AqiConfig ?? null)
        : level;
    const resolvedLevel = levelFromValue !== 'no-value' ? levelFromValue : level;
    const label = getAirQualityLabel(resolvedLevel, 'WHO', 'PM2.5', pm25AqiConfig ?? null);
    const color = getAirQualityColor(resolvedLevel, pm25AqiConfig ?? null);
    const Icon = getAirQualityIcon(resolvedLevel);

    if (resolvedLevel === 'no-value') {
      return <span className="text-gray-300 dark:text-gray-600">—</span>;
    }

    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
        style={{ backgroundColor: color || '#6B7280' }}
      >
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  };

  const columns = useMemo(() => {
    const rightAlign = {
      headerClassName: 'text-right',
      cellClassName: 'whitespace-nowrap text-right',
    };

    return [
      {
        key: 'name',
        label: 'Location',
        sortable: true,
        render: (_value: unknown, item: ComparisonRow) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{item.name}</p>
            {(item.city || item.country) && (
              <p className="truncate text-xs text-muted-foreground">
                {[item.city, item.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'pm2_5',
        label: 'PM2.5',
        sortable: true,
        ...rightAlign,
        render: (value: unknown) =>
          renderValue(typeof value === 'number' ? value : null, 'pm2_5'),
      },
      {
        key: 'pm10',
        label: 'PM10',
        sortable: true,
        ...rightAlign,
        render: (value: unknown) =>
          renderValue(typeof value === 'number' ? value : null, 'pm10'),
      },
      {
        key: 'dailyAvg',
        label: 'Daily Avg',
        sortable: true,
        ...rightAlign,
        render: (value: unknown) =>
          renderValue(typeof value === 'number' ? value : null, 'pm2_5'),
      },
      {
        key: 'category',
        label: 'AQI level',
        sortable: true,
        ...rightAlign,
        render: (value: unknown, item: ComparisonRow) => (
          <div className="flex justify-end">
            {renderCategory(
              typeof value === 'string' ? value : null,
              item.pm2_5
            )}
          </div>
        ),
      },
      {
        key: 'percentageDifference',
        label: 'Trend',
        sortable: true,
        ...rightAlign,
        render: (value: unknown) =>
          renderTrend(typeof value === 'number' ? value : null),
      },
      {
        key: 'time',
        label: 'Last reading',
        sortable: true,
        ...rightAlign,
        render: (value: unknown) => (
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(typeof value === 'string' ? value : null)}
          </span>
        ),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pm25AqiConfig, pm10AqiConfig]);

  return (
    <ServerSideTable
      title="Location comparison"
      data={rows}
      columns={columns}
      loading={isLoading}
      isRefreshing={isFetching}
      error={error ? error.message : null}
      onRefresh={() => void refetch()}
      searchableColumns={['name', 'city', 'country']}
      showClientPagination
      className={className}
      customHeader={
        <div className="w-full space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Latest readings across all {siteIds.length} selected location
              {siteIds.length === 1 ? '' : 's'} — no limit applied.
            </p>
            <Button
              variant="outlined"
              size="sm"
              Icon={AqRefreshCcw01}
              onClick={() => void refetch()}
              loading={isLoading}
              disabled={isLoading}
              aria-label="Refresh comparison"
            >
              Refresh
            </Button>
          </div>
          <AqiLegend aqiConfig={aqiConfig} />
        </div>
      }
      emptyComponent={
        <EmptyState
          compact
          title="No locations to compare"
          description="Add locations to your charts to see their latest readings side by side."
          className="min-h-[300px] border-0 bg-transparent"
        />
      }
    />
  );
};

export default ComparisonTable;
