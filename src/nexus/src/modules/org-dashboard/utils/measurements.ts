'use client';

import {
  getAirQualityLevel,
  type AirQualityLevel,
  type PollutantType,
} from '@/shared/utils/airQuality';
import type { AqiConfig } from '@/shared/types/aqi';
import type { SiteData } from '@/modules/analytics';
import type { NormalizedChartData } from '@/shared/components/charts/types';
import { getErrorStatus } from '@/shared/lib/retryPolicy';

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

/**
 * Maps an API error to a user-safe message. Rate limits (429) get an
 * actionable copy, empty-cohort 400s a targeted one — never a raw
 * "Request failed with status code 429". Abort errors return null so
 * cancellation never surfaces to the user.
 */
export const getFriendlyErrorMessage = (error: unknown): string | null => {
  if (isAbortError(error)) return null;
  const status = getErrorStatus(error) ?? getStatusFromMessage(error);

  if (status === 429) {
    return 'You are requesting data too quickly. Please wait a moment and try again.';
  }
  if (status === 400) {
    const message = extractErrorMessage(error);
    if (message && /process measurements|cohort/i.test(message)) {
      return 'No active devices with measurements were found for this cohort. Check the organization setup or try again later.';
    }
  }
  if (status !== null && status >= 500) {
    return 'The service is temporarily unavailable. Please try again shortly.';
  }

  return extractErrorMessage(error) ?? 'Unable to load data. Please try again.';
};

const getStatusFromMessage = (error: unknown): number | null => {
  const message = extractErrorMessage(error);
  if (!message) return null;
  const match = message.match(/status code (\d{3})/i);
  return match ? Number(match[1]) : null;
};

const extractErrorMessage = (error: unknown): string | null => {
  if (typeof error === 'string') {
    return error.trim() || null;
  }
  const candidate = error as {
    message?: unknown;
    response?: { data?: { message?: unknown } };
  } | null;
  const backendMessage = candidate?.response?.data?.message;
  if (typeof backendMessage === 'string' && backendMessage.trim()) {
    return backendMessage.trim();
  }
  const message = candidate?.message;
  return typeof message === 'string' && message.trim() ? message.trim() : null;
};

export interface FleetSummary {
  /** Saved locations in total. */
  totalSiteCount: number;
  /** Saved locations with a current reading for the selected pollutant. */
  monitoredSiteCount: number;
  averageConcentration: number | null;
  averageLevel: AirQualityLevel;
  worstSite: { name: string; value: number } | null;
  cleanestSite: { name: string; value: number } | null;
}

/** A card is reportable only when it contains a real API reading. */
export const isReportableSiteCard = (card: SiteData): boolean =>
  card.status !== 'no-value' &&
  typeof card.value === 'number' &&
  Number.isFinite(card.value);

/**
 * Aggregates the saved-location cards (built from GET /devices/readings/recent,
 * the same service the favorites module uses) into dashboard summary stats.
 * The fleet average is the mean pollutant concentration across reporting
 * locations, classified with the live AQI config.
 */
export const summarizeSiteCards = (
  siteCards: SiteData[] | null | undefined,
  pollutant: PollutantType,
  aqiConfig?: AqiConfig | null
): FleetSummary => {
  const cards = Array.isArray(siteCards) ? siteCards : [];

  const reporting = cards.filter(isReportableSiteCard);

  if (reporting.length === 0) {
    return {
      totalSiteCount: cards.length,
      monitoredSiteCount: 0,
      averageConcentration: null,
      averageLevel: 'no-value',
      worstSite: null,
      cleanestSite: null,
    };
  }

  const sum = reporting.reduce((acc, card) => acc + card.value, 0);
  const averageConcentration = sum / reporting.length;

  const worst = reporting.reduce((a, b) => (a.value > b.value ? a : b));
  const cleanest = reporting.reduce((a, b) => (a.value < b.value ? a : b));

  return {
    totalSiteCount: cards.length,
    monitoredSiteCount: reporting.length,
    averageConcentration,
    averageLevel: getAirQualityLevel(
      averageConcentration,
      pollutant,
      aqiConfig
    ),
    worstSite: { name: worst.name || worst.location, value: worst.value },
    cleanestSite: {
      name: cleanest.name || cleanest.location,
      value: cleanest.value,
    },
  };
};

export interface LevelDistribution {
  level: AirQualityLevel;
  count: number;
  color: string;
}

const AQI_LEVEL_TO_RANGE_KEY: Record<string, string> = {
  good: 'good',
  moderate: 'moderate',
  'unhealthy-sensitive-groups': 'u4sg',
  unhealthy: 'unhealthy',
  'very-unhealthy': 'very_unhealthy',
  hazardous: 'hazardous',
};

/**
 * Counts the saved locations per AQI category from the recent-readings
 * cards. Locations without a reading land in a trailing `no-value` bucket so
 * the distribution always accounts for every saved site.
 */
export const countLevelDistribution = (
  siteCards: SiteData[] | null | undefined,
  aqiConfig?: AqiConfig | null
): LevelDistribution[] => {
  const counts = new Map<AirQualityLevel, number>();
  LEVEL_ORDER.forEach(level => counts.set(level, 0));
  counts.set('no-value', 0);

  const cards = Array.isArray(siteCards) ? siteCards : [];
  cards.forEach(card => {
    const level = card.status;
    counts.set(level, (counts.get(level) ?? 0) + 1);
  });

  return [
    ...LEVEL_ORDER.map(level => ({
      level,
      count: counts.get(level) ?? 0,
      color: aqiConfig?.ranges?.find(
        range => range.key === AQI_LEVEL_TO_RANGE_KEY[level]
      )?.color as string,
    })),
    {
      level: 'no-value' as AirQualityLevel,
      count: counts.get('no-value') ?? 0,
      color: '#6B7280',
    },
  ];
};

export const FLEET_AVERAGE_SERIES_KEY = 'Fleet average';

/**
 * Builds the fleet-average daily series from chart data (the aggregated D3
 * chart service): mean pollutant concentration across the saved locations
 * per day, rendered as its own series on the trend chart.
 */
export const buildFleetAverageSeries = (
  chartData: NormalizedChartData[] | null | undefined
): NormalizedChartData[] => {
  if (!Array.isArray(chartData) || chartData.length === 0) return [];

  const byDay = new Map<string, { sum: number; count: number }>();

  for (const point of chartData) {
    const value = point.value;
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    const day = (point.time || '').slice(0, 10);
    if (!day) continue;

    const bucket = byDay.get(day) ?? { sum: 0, count: 0 };
    bucket.sum += value;
    bucket.count += 1;
    byDay.set(day, bucket);
  }

  return Array.from(byDay.entries())
    .map(([day, { sum, count }]) => ({
      time: day,
      value: Number((sum / count).toFixed(2)),
      site: FLEET_AVERAGE_SERIES_KEY,
      site_id: '',
      device_id: '',
    }))
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
};
