'use client';

import type { Measurement, SiteAverages } from '@/shared/types/api';
import type { Site } from '@/shared/types/api';
import {
  getAirQualityLevel,
  getPollutantLabel,
  type AirQualityLevel,
  type PollutantType,
} from '@/shared/utils/airQuality';
import type { AqiConfig } from '@/shared/types/aqi';
import { getSiteDisplayName } from '@/shared/utils/siteUtils';
import type { SiteData } from '@/modules/analytics';

export const LEVEL_ORDER: AirQualityLevel[] = [
  'good',
  'moderate',
  'unhealthy-sensitive-groups',
  'unhealthy',
  'very-unhealthy',
  'hazardous',
];

export const isAbortError = (error: unknown): boolean => {
  const candidate = error as {
    name?: string;
    code?: string;
    message?: string;
  } | null;
  if (!candidate) return false;
  return (
    candidate.name === 'AbortError' ||
    candidate.name === 'CanceledError' ||
    candidate.code === 'ERR_CANCELED' ||
    candidate.message === 'canceled'
  );
};

export const getMeasurementValue = (
  measurement: Measurement,
  pollutant: PollutantType
): number | null => {
  const entry = measurement[pollutant];
  const value = entry?.value;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

/**
 * Reduces a measurement list (which can contain several devices per site) to
 * the latest reading per site. Prefers readings flagged as primary; among
 * equals, the newest `time` wins.
 */
export const latestMeasurementPerSite = (
  measurements: Measurement[] | null | undefined
): Map<string, Measurement> => {
  const latest = new Map<string, Measurement>();
  if (!Array.isArray(measurements)) return latest;

  for (const measurement of measurements) {
    const siteId = measurement.site_id || measurement.device_id;
    if (!siteId) continue;

    const existing = latest.get(siteId);
    if (!existing) {
      latest.set(siteId, measurement);
      continue;
    }

    const existingPrimary = existing.is_reading_primary === true;
    const incomingPrimary = measurement.is_reading_primary === true;
    const existingTime = new Date(existing.time).getTime() || 0;
    const incomingTime = new Date(measurement.time).getTime() || 0;

    const prefersIncoming =
      (incomingPrimary && !existingPrimary) ||
      (incomingPrimary === existingPrimary && incomingTime >= existingTime);
    if (prefersIncoming) {
      latest.set(siteId, measurement);
    }
  }

  return latest;
};

export interface FleetSummary {
  monitoredSiteCount: number;
  onlineDeviceCount: number;
  averageConcentration: number | null;
  averageLevel: AirQualityLevel;
  worstSite: { siteId: string; value: number } | null;
  cleanestSite: { siteId: string; value: number } | null;
}

/**
 * Aggregates the fleet's latest readings into dashboard summary stats.
 * The fleet average is the mean pollutant concentration across sites —
 * consistent with the backend's own averaging logic — then classified with
 * the live AQI config (never averaged-then-misclassified index values).
 */
export const summarizeFleetMeasurements = (
  latestBySite: Map<string, Measurement>,
  pollutant: PollutantType,
  aqiConfig?: AqiConfig | null
): FleetSummary => {
  const readingsWithValue: { siteId: string; value: number }[] = [];

  latestBySite.forEach((measurement, siteId) => {
    const value = getMeasurementValue(measurement, pollutant);
    if (value !== null) {
      readingsWithValue.push({ siteId, value });
    }
  });

  const onlineDeviceCount = Array.from(latestBySite.values()).filter(
    measurement => measurement.deviceDetails?.isOnline === true
  ).length;

  if (readingsWithValue.length === 0) {
    return {
      monitoredSiteCount: latestBySite.size,
      onlineDeviceCount,
      averageConcentration: null,
      averageLevel: 'no-value',
      worstSite: null,
      cleanestSite: null,
    };
  }

  const sum = readingsWithValue.reduce((acc, item) => acc + item.value, 0);
  const averageConcentration = sum / readingsWithValue.length;

  const worstSite = readingsWithValue.reduce((a, b) =>
    a.value > b.value ? a : b
  );
  const cleanestSite = readingsWithValue.reduce((a, b) =>
    a.value < b.value ? a : b
  );

  return {
    monitoredSiteCount: latestBySite.size,
    onlineDeviceCount,
    averageConcentration,
    averageLevel: getAirQualityLevel(
      averageConcentration,
      pollutant,
      aqiConfig
    ),
    worstSite,
    cleanestSite,
  };
};

export interface LevelDistribution {
  level: AirQualityLevel;
  count: number;
  color: string;
}

/**
 * Counts how many sites fall into each AQI category based on the latest
 * per-site readings for the selected pollutant. Sites without a reading for
 * the pollutant are counted in a trailing `no-value` bucket so the
 * distribution always accounts for every monitored site.
 */
export const countLevelDistribution = (
  latestBySite: Map<string, Measurement>,
  pollutant: PollutantType,
  aqiConfig?: AqiConfig | null
): LevelDistribution[] => {
  const counts = new Map<AirQualityLevel, number>();
  LEVEL_ORDER.forEach(level => counts.set(level, 0));
  counts.set('no-value', 0);

  latestBySite.forEach(measurement => {
    const value = getMeasurementValue(measurement, pollutant);
    const level =
      value === null
        ? 'no-value'
        : getAirQualityLevel(value, pollutant, aqiConfig);
    counts.set(level, (counts.get(level) ?? 0) + 1);
  });

  return [
    ...LEVEL_ORDER.map(level => ({
      level,
      count: counts.get(level) ?? 0,
      color: aqiConfig?.ranges?.find(
        range =>
          range.key === level.replace('unhealthy-sensitive-groups', 'u4sg')
      )?.color as string,
    })),
    {
      level: 'no-value' as AirQualityLevel,
      count: counts.get('no-value') ?? 0,
      color: '#6B7280',
    },
  ];
};

/**
 * Builds a daily series for the fleet: average of pollutant concentrations
 * across all devices/sites per UTC day.
 */
export interface DailyPoint {
  date: string;
  value: number | null;
}

export const buildFleetDailySeries = (
  measurements: Measurement[] | null | undefined,
  pollutant: PollutantType
): DailyPoint[] => {
  if (!Array.isArray(measurements) || measurements.length === 0) return [];

  const byDay = new Map<string, { sum: number; count: number }>();

  for (const measurement of measurements) {
    const value = getMeasurementValue(measurement, pollutant);
    if (value === null) continue;

    const day = (measurement.time || '').slice(0, 10);
    if (!day) continue;

    const bucket = byDay.get(day) ?? { sum: 0, count: 0 };
    bucket.sum += value;
    bucket.count += 1;
    byDay.set(day, bucket);
  }

  return Array.from(byDay.entries())
    .map(([date, { sum, count }]) => ({
      date,
      value: Number((sum / count).toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Builds per-site daily series from historical measurements, keyed by site id.
 * Used to render one trend line per saved location.
 */
export const buildSiteDailySeriesMap = (
  measurements: Measurement[] | null | undefined,
  pollutant: PollutantType
): Map<string, DailyPoint[]> => {
  const series = new Map<string, Map<string, { sum: number; count: number }>>();

  if (!Array.isArray(measurements)) return new Map<string, DailyPoint[]>();

  for (const measurement of measurements) {
    const value = getMeasurementValue(measurement, pollutant);
    if (value === null) continue;

    const siteId = measurement.site_id || measurement.device_id;
    const day = (measurement.time || '').slice(0, 10);
    if (!siteId || !day) continue;

    const siteBucket =
      series.get(siteId) ?? new Map<string, { sum: number; count: number }>();
    const bucket = siteBucket.get(day) ?? { sum: 0, count: 0 };
    bucket.sum += value;
    bucket.count += 1;
    siteBucket.set(day, bucket);
    series.set(siteId, siteBucket);
  }

  const result = new Map<string, DailyPoint[]>();
  series.forEach((siteBucket, siteId) => {
    result.set(
      siteId,
      Array.from(siteBucket.entries())
        .map(([date, { sum, count }]) => ({
          date,
          value: Number((sum / count).toFixed(2)),
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    );
  });

  return result;
};

const getSiteKey = (site: Site): string => {
  return site._id || '';
};

export interface LocationCardData extends SiteData {
  measurementTime?: string;
  dataProvider?: string;
}

/**
 * Maps a saved (preference-selected) location to a display card: live value
 * from the latest cohort measurement, trend from the site-averages endpoint.
 */
export const buildLocationCardData = ({
  site,
  measurement,
  averages,
  pollutant,
  aqiConfig,
}: {
  site: Site;
  measurement: Measurement | null;
  averages: SiteAverages | null;
  pollutant: PollutantType;
  aqiConfig?: AqiConfig | null;
}): LocationCardData => {
  const value = measurement
    ? getMeasurementValue(measurement, pollutant)
    : null;
  const status =
    value === null
      ? 'no-value'
      : getAirQualityLevel(value, pollutant, aqiConfig);

  const percentageDifference = averages?.percentageDifference ?? null;
  const trend: 'up' | 'down' | 'stable' =
    percentageDifference === null || percentageDifference === undefined
      ? 'stable'
      : percentageDifference >= 1
        ? 'up'
        : percentageDifference <= -1
          ? 'down'
          : 'stable';

  return {
    _id: getSiteKey(site),
    name: getSiteDisplayName(site),
    location: [site.city, site.country].filter(Boolean).join(', '),
    country: site.country,
    city: site.city,
    region: site.region,
    value: value ?? 0,
    status,
    pollutant,
    unit: 'µg/m³',
    trend,
    percentageDifference: percentageDifference ?? undefined,
    measurementTime: measurement?.time,
    dataProvider: measurement?.siteDetails?.data_provider,
  };
};

/**
 * Derives the fleet average from a daily series for the period's last day —
 * used as the chart subtitle ("Average: 12.3 µg/m³").
 */
export const getLatestFleetAverage = (series: DailyPoint[]): number | null => {
  if (series.length === 0) return null;
  const last = series[series.length - 1];
  return last.value;
};

export const POLLUTANT_LABEL = getPollutantLabel;
