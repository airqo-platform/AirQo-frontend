/**
 * Air Quality Utility Functions and Constants
 *
 * This utility provides centralized air quality management including:
 * - Air quality icons mapping
 * - Pollutant ranges and standards
 * - Level calculations and color assignments
 * - Standard organization values (WHO, NEMA)
 *
 * Use this utility across all modules (analytics, charts, airqo-map) to ensure
 * consistency and ease of maintenance.
 */

import {
  AqGood,
  AqHazardous,
  AqModerate,
  AqNoValue,
  AqUnhealthy,
  AqUnhealthyForSensitiveGroups,
  AqVeryUnhealthy,
  AqArrowDown,
  AqArrowUp,
} from '@airqo/icons-react';
import { HiMinus } from 'react-icons/hi';
import type { ComponentType } from 'react';
import type { AqiConfig, AqiPollutant, AqiRangeKey } from '@/shared/types/aqi';

// ========================================
// TYPES
// ========================================

export type AirQualityLevel =
  | 'good'
  | 'moderate'
  | 'unhealthy-sensitive-groups'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous'
  | 'no-value';

// TODO: Expand to support additional pollutants (no2, o3, co, so2) when needed
export type PollutantType = AqiPollutant;

export type StandardsOrganization =
  | 'WHO'
  | 'NEMA_UGANDA'
  | 'NEMA_KENYA'
  | 'RWANDA'
  | 'GHANA'
  | 'SOUTH_AFRICA'
  | 'NIGERIA';

export interface AirQualityStandard {
  level: string;
  range: {
    min: number;
    max: number;
  };
  color: string;
  description: string;
}

export interface AirQualityInfo {
  level: AirQualityLevel;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description?: string;
  // Note: AirQo icons have built-in colors, no need for custom color handling
}

export interface StandardValues {
  pm2_5: number | null;
  pm10: number;
}

export type StandardPollutant = 'PM2.5' | 'PM10';

export interface AirQualityLimitSet {
  annual: number | null;
  daily: number | null;
  annualExceedanceRule?: string;
  dailyExceedanceRule?: string;
  context?: string;
  areaLimits?: Array<{
    area: string;
    annual: number;
    daily: number;
    dailyExceedanceRule?: string;
  }>;
  nextPhase?: {
    effectiveDate: string;
    starts: string;
    annual: number;
    daily: number;
  };
  unavailableReason?: string;
}

export interface AirQualityStandardSource {
  label: string;
  url: string;
}

export interface OfficialAirQualityStandard {
  kind: string;
  instrument: string;
  sources: AirQualityStandardSource[];
  note?: string;
  pollutants: Record<StandardPollutant, AirQualityLimitSet>;
}

// ========================================
// AIR QUALITY ICONS
// ========================================

export const AIR_QUALITY_ICONS: Record<
  AirQualityLevel,
  ComponentType<{ className?: string }>
> = {
  good: AqGood,
  moderate: AqModerate,
  'unhealthy-sensitive-groups': AqUnhealthyForSensitiveGroups,
  unhealthy: AqUnhealthy,
  'very-unhealthy': AqVeryUnhealthy,
  hazardous: AqHazardous,
  'no-value': AqNoValue,
} as const;

// Trend icons for air quality trends
export const TREND_ICONS = {
  up: AqArrowUp,
  down: AqArrowDown,
  stable: HiMinus,
} as const;

// ========================================
// AIR QUALITY COLORS
// ========================================

export const AIR_QUALITY_COLORS: Record<AirQualityLevel, string> = {
  // Populated from /devices/aqi-ranges by AqiConfigProvider.
  good: '',
  moderate: '',
  'unhealthy-sensitive-groups': '',
  unhealthy: '',
  'very-unhealthy': '',
  hazardous: '',
  'no-value': '#6B7280', // gray-500
} as Record<AirQualityLevel, string>;

let activeAqiConfig: AqiConfig | null = null;
const activeAqiConfigs = new Map<PollutantType, AqiConfig>();

export const setActiveAqiConfig = (config: AqiConfig | null): void => {
  if (!config) {
    activeAqiConfig = null;
    activeAqiConfigs.clear();
  } else {
    activeAqiConfigs.set(config.pollutant, config);
    if (config.pollutant === 'pm2_5') {
      activeAqiConfig = config;
    }
  }

  for (const level of Object.keys(AQI_RANGE_KEY_BY_LEVEL) as Array<
    Exclude<AirQualityLevel, 'no-value'>
  >) {
    const range = config?.ranges.find(
      item => item.key === AQI_RANGE_KEY_BY_LEVEL[level]
    );
    AIR_QUALITY_COLORS[level] = range?.color ?? '';
  }
};

export const getActiveAqiConfig = (): AqiConfig | null => activeAqiConfig;

export const getActiveAqiConfigForPollutant = (
  pollutant: PollutantType
): AqiConfig | null => activeAqiConfigs.get(pollutant) ?? null;

/**
 * True when AIR_QUALITY_COLORS currently holds exactly the colors
 * `setActiveAqiConfig(config)` would write. Read-only drift detector: lets
 * default-pollutant consumers notice that another pollutant (e.g. pm10)
 * re-activated the shared color table — the per-pollutant registry entry is
 * left intact by such an activation, so only this color comparison can
 * detect it. Mirrors the write loop in setActiveAqiConfig.
 */
export const airQualityColorsMatchConfig = (
  config: AqiConfig | null
): boolean => {
  for (const level of Object.keys(AQI_RANGE_KEY_BY_LEVEL) as Array<
    Exclude<AirQualityLevel, 'no-value'>
  >) {
    const range = config?.ranges.find(
      item => item.key === AQI_RANGE_KEY_BY_LEVEL[level]
    );
    if (AIR_QUALITY_COLORS[level] !== (range?.color ?? '')) return false;
  }
  return true;
};

export const AQI_RANGE_KEY_BY_LEVEL: Record<
  Exclude<AirQualityLevel, 'no-value'>,
  AqiRangeKey
> = {
  good: 'good',
  moderate: 'moderate',
  'unhealthy-sensitive-groups': 'u4sg',
  unhealthy: 'unhealthy',
  'very-unhealthy': 'very_unhealthy',
  hazardous: 'hazardous',
};

export const getAqiRangeForLevel = (
  level: AirQualityLevel,
  config: AqiConfig | null = activeAqiConfig
) => {
  const key = level === 'no-value' ? null : AQI_RANGE_KEY_BY_LEVEL[level];
  return key ? config?.ranges.find(range => range.key === key) : undefined;
};

export const getAirQualityLevelForRangeKey = (
  key: AqiRangeKey
): AirQualityLevel => {
  const level = (
    Object.keys(AQI_RANGE_KEY_BY_LEVEL) as Array<
      Exclude<AirQualityLevel, 'no-value'>
    >
  ).find(candidate => AQI_RANGE_KEY_BY_LEVEL[candidate] === key);
  return level ?? 'no-value';
};

// ========================================
// WHO AIR QUALITY STANDARDS
// ========================================

export const WHO_PM25_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 5 },
    color: '#10B981', // green-500
    description: 'WHO 2021 Annual guideline (5 µg/m³) - Minimal health risk',
  },
  {
    level: 'Moderate',
    range: { min: 5, max: 15 },
    color: '#F59E0B', // amber-500
    description: 'Above WHO annual but within 24-hour guideline (15 µg/m³)',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 15, max: 25 },
    color: '#EF4444', // red-500
    description:
      'Above WHO 24-hour guideline - sensitive groups may experience health effects',
  },
  {
    level: 'Unhealthy',
    range: { min: 25, max: 35 },
    color: '#8B5CF6', // violet-500
    description: 'Everyone may experience health effects',
  },
  {
    level: 'Very Unhealthy',
    range: { min: 35, max: 75 },
    color: '#DC2626', // red-600
    description: 'Health warnings - emergency conditions',
  },
  {
    level: 'Hazardous',
    range: { min: 75, max: Infinity },
    color: '#7C2D12', // red-900
    description: 'Health alert - serious risk to everyone',
  },
];

export const WHO_PM10_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 15 },
    color: '#10B981', // green-500
    description: 'WHO 2021 Annual guideline (15 µg/m³) - Minimal health risk',
  },
  {
    level: 'Moderate',
    range: { min: 15, max: 45 },
    color: '#F59E0B', // amber-500
    description: 'Above WHO annual but within 24-hour guideline (45 µg/m³)',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 45, max: 75 },
    color: '#EF4444', // red-500
    description:
      'Above WHO 24-hour guideline - sensitive groups may experience health effects',
  },
  {
    level: 'Unhealthy',
    range: { min: 75, max: 150 },
    color: '#8B5CF6', // violet-500
    description: 'Everyone may experience health effects',
  },
  {
    level: 'Very Unhealthy',
    range: { min: 150, max: 250 },
    color: '#DC2626', // red-600
    description: 'Health warnings - emergency conditions',
  },
  {
    level: 'Hazardous',
    range: { min: 250, max: Infinity },
    color: '#7C2D12', // red-900
    description: 'Health alert - serious risk to everyone',
  },
];

// ========================================
// NEMA UGANDA AIR QUALITY STANDARDS
// ========================================

export const NEMA_PM25_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 12 },
    color: '#10B981', // green-500
    description: 'Well below NEMA annual limit - Good air quality',
  },
  {
    level: 'Moderate',
    range: { min: 12, max: 25 },
    color: '#F59E0B', // amber-500
    description: 'Within NEMA annual limit (25 µg/m³) - Acceptable',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 25, max: 35 },
    color: '#EF4444', // red-500
    description: 'Above NEMA annual but below 24-hour limit',
  },
  {
    level: 'Unhealthy',
    range: { min: 35, max: 50 },
    color: '#8B5CF6', // violet-500
    description: 'Above NEMA 24-hour limit (35 µg/m³)',
  },
  {
    level: 'Very Unhealthy',
    range: { min: 50, max: 100 },
    color: '#DC2626', // red-600
    description: 'Significantly above NEMA limits',
  },
  {
    level: 'Hazardous',
    range: { min: 100, max: Infinity },
    color: '#7C2D12', // red-900
    description: 'Extremely high - Health emergency',
  },
];

export const NEMA_PM10_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 20 },
    color: '#10B981', // green-500
    description: 'Well below NEMA Uganda annual limit - Good air quality',
  },
  {
    level: 'Moderate',
    range: { min: 20, max: 40 },
    color: '#F59E0B', // amber-500
    description: 'Within NEMA Uganda annual limit (40 µg/m³) - Acceptable',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 40, max: 60 },
    color: '#EF4444', // red-500
    description: 'Above NEMA Uganda annual but within 24-hour limit',
  },
  {
    level: 'Unhealthy',
    range: { min: 60, max: 100 },
    color: '#8B5CF6', // violet-500
    description: 'Above NEMA Uganda 24-hour limit (60 µg/m³)',
  },
  {
    level: 'Very Unhealthy',
    range: { min: 100, max: 200 },
    color: '#DC2626', // red-600
    description: 'Significantly above NEMA Uganda limits',
  },
  {
    level: 'Hazardous',
    range: { min: 200, max: Infinity },
    color: '#7C2D12', // red-900
    description: 'Extremely high - Health emergency',
  },
];

// ========================================
// NEMA KENYA AIR QUALITY STANDARDS
// ========================================
// Based on Kenya Legal Notice 180 of 2024 - Environmental Management and
// Co-ordination (Air Quality) Regulations, 2024

export const NEMA_KENYA_PM25_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 17.5 },
    color: '#10B981', // green-500
    description: 'Well below NEMA Kenya annual limit - Good air quality',
  },
  {
    level: 'Moderate',
    range: { min: 17.5, max: 35 },
    color: '#F59E0B', // amber-500
    description: 'Within NEMA Kenya annual limit (35 µg/m³) - Acceptable',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 35, max: 75 },
    color: '#EF4444', // red-500
    description: 'Above NEMA Kenya annual but within 24-hour limit (75 µg/m³)',
  },
  {
    level: 'Unhealthy',
    range: { min: 75, max: 110 },
    color: '#8B5CF6', // violet-500
    description: 'Above NEMA Kenya 24-hour limit',
  },
  {
    level: 'Very Unhealthy',
    range: { min: 110, max: 150 },
    color: '#DC2626', // red-600
    description: 'Significantly above NEMA Kenya limits',
  },
  {
    level: 'Hazardous',
    range: { min: 150, max: Infinity },
    color: '#7C2D12', // red-900
    description: 'Health emergency - Take immediate action',
  },
];

export const NEMA_KENYA_PM10_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 35 },
    color: '#10B981', // green-500
    description: 'Well below NEMA Kenya annual limit - Good air quality',
  },
  {
    level: 'Moderate',
    range: { min: 35, max: 70 },
    color: '#F59E0B', // amber-500
    description: 'Within NEMA Kenya annual limit (70 µg/m³) - Acceptable',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 70, max: 150 },
    color: '#EF4444', // red-500
    description: 'Above NEMA Kenya annual but within 24-hour limit (150 µg/m³)',
  },
  {
    level: 'Unhealthy',
    range: { min: 150, max: 225 },
    color: '#8B5CF6', // violet-500
    description: 'Above NEMA Kenya 24-hour limit',
  },
  {
    level: 'Very Unhealthy',
    range: { min: 225, max: 300 },
    color: '#DC2626', // red-600
    description: 'Significantly above NEMA Kenya limits',
  },
  {
    level: 'Hazardous',
    range: { min: 300, max: Infinity },
    color: '#7C2D12', // red-900
    description: 'Health emergency - Take immediate action',
  },
];

// ========================================
// SOUTH AFRICA AIR QUALITY STANDARDS
// ========================================
// National Ambient Air Quality Standards under the National Environmental
// Management: Air Quality Act (Act 39 of 2004) — Government Notices 1210 of
// 2009 (PM10) and 486 of 2012 (PM2.5), current compliance phase (2016–2029).

export const SOUTH_AFRICA_PM25_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 10 },
    color: '#10B981', // green-500
    description: 'Well below the SA annual standard - Good air quality',
  },
  {
    level: 'Moderate',
    range: { min: 10, max: 20 },
    color: '#F59E0B', // amber-500
    description: 'Within the SA annual standard (20 µg/m³) - Acceptable',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 20, max: 40 },
    color: '#EF4444', // red-500
    description: 'Above the SA annual but within 24-hour standard (40 µg/m³)',
  },
  {
    level: 'Unhealthy',
    range: { min: 40, max: 60 },
    color: '#8B5CF6', // violet-500
    description: 'Above the SA 24-hour standard',
  },
  {
    level: 'Very Unhealthy',
    range: { min: 60, max: 120 },
    color: '#DC2626', // red-600
    description: 'Significantly above the SA standards',
  },
  {
    level: 'Hazardous',
    range: { min: 120, max: Infinity },
    color: '#7C2D12', // red-900
    description: 'Health emergency - Take immediate action',
  },
];

export const SOUTH_AFRICA_PM10_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 20 },
    color: '#10B981', // green-500
    description: 'Well below the SA annual standard - Good air quality',
  },
  {
    level: 'Moderate',
    range: { min: 20, max: 40 },
    color: '#F59E0B', // amber-500
    description: 'Within the SA annual standard (40 µg/m³) - Acceptable',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 40, max: 75 },
    color: '#EF4444', // red-500
    description: 'Above the SA annual but within 24-hour standard (75 µg/m³)',
  },
  {
    level: 'Unhealthy',
    range: { min: 75, max: 150 },
    color: '#8B5CF6', // violet-500
    description: 'Above the SA 24-hour standard',
  },
  {
    level: 'Very Unhealthy',
    range: { min: 150, max: 250 },
    color: '#DC2626', // red-600
    description: 'Significantly above the SA standards',
  },
  {
    level: 'Hazardous',
    range: { min: 250, max: Infinity },
    color: '#7C2D12', // red-900
    description: 'Health emergency - Take immediate action',
  },
];

// ========================================
// NIGERIA AIR QUALITY STANDARDS
// ========================================
// National Environmental (Air Quality Control) Regulations, 2021 (S.I. No. 88
// of 2021, Official Gazette No. 161 of 2021) — National Environmental
// Standards and Regulations Enforcement Agency (NESREA).

// The 2021 Gazette lists numeric PM2.5 limits but does not define the named
// health-category breakpoints used by this legacy array. Keep the category
// list empty rather than presenting app-defined ranges as NESREA categories.
export const NIGERIA_PM25_STANDARDS: AirQualityStandard[] = [];

export const NIGERIA_PM10_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 30 },
    color: '#10B981', // green-500
    description: 'Well below the NESREA annual standard - Good air quality',
  },
  {
    level: 'Moderate',
    range: { min: 30, max: 60 },
    color: '#F59E0B', // amber-500
    description: 'Within the NESREA annual standard (60 µg/m³) - Acceptable',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 60, max: 150 },
    color: '#EF4444', // red-500
    description:
      'Above the NESREA annual but within 24-hour standard (150 µg/m³)',
  },
  {
    level: 'Unhealthy',
    range: { min: 150, max: 225 },
    color: '#8B5CF6', // violet-500
    description: 'Above the NESREA 24-hour standard',
  },
  {
    level: 'Very Unhealthy',
    range: { min: 225, max: 300 },
    color: '#DC2626', // red-600
    description: 'Significantly above the NESREA standards',
  },
  {
    level: 'Hazardous',
    range: { min: 300, max: Infinity },
    color: '#7C2D12', // red-900
    description: 'Health emergency - Take immediate action',
  },
];

// ========================================
// STANDARD REFERENCE VALUES
// ========================================

/** Annual reference values used by consumers that need a single threshold. */
export const AQ_STANDARDS: Record<StandardsOrganization, StandardValues> = {
  WHO: {
    pm2_5: 5, // WHO 2021 annual guideline: 5 µg/m³
    pm10: 15, // WHO 2021 annual guideline: 15 µg/m³
  },
  NEMA_UGANDA: {
    pm2_5: 25, // Uganda SI 22/2024 annual limit: 25 µg/m³
    pm10: 40, // Uganda SI 22/2024 annual limit: 40 µg/m³
  },
  NEMA_KENYA: {
    pm2_5: 35, // Kenya LN 180/2024 annual limit: 35 µg/m³
    // The chart default is residential/rural/other; the regulation also has
    // industrial and controlled-area PM10 limits, exposed in the standards UI.
    pm10: 50,
  },
  RWANDA: {
    pm2_5: 35, // RS EAS 751:2010 annual limit: 35 µg/m³
    pm10: 50, // Residential/rural/other-area annual limit: 50 µg/m³
  },
  GHANA: {
    pm2_5: null, // GS 1236:2019 does not specify an annual PM2.5 limit.
    pm10: 70, // GS 1236:2019 annual limit: 70 µg/m³
  },
  SOUTH_AFRICA: {
    pm2_5: 20, // SA GN 486/2012 annual standard (current phase): 20 µg/m³
    pm10: 40, // SA GN 1210/2009 annual standard: 40 µg/m³
  },
  NIGERIA: {
    pm2_5: 20, // SI 88/2021 Schedule XIII annual ambient limit: 20 µg/m³
    pm10: 60, // Nigeria SI 88/2021 annual standard: 60 µg/m³
  },
} as const;

/** Snapshot values retained for backwards compatibility. Use
 * getCurrentReferenceLines for date-sensitive chart rendering. */
export const REFERENCE_LINES = {
  WHO: {
    PM25_ANNUAL: 5,
    PM25_24HR: 15,
    PM10_ANNUAL: 15,
    PM10_24HR: 45,
  },
  NEMA_UGANDA: {
    PM25_ANNUAL: 25,
    PM25_24HR: 35,
    PM10_ANNUAL: 40,
    PM10_24HR: 60,
  },
  NEMA_KENYA: {
    PM25_ANNUAL: 35,
    PM25_24HR: 75,
    PM10_ANNUAL: 50,
    PM10_24HR: 100,
  },
  RWANDA: {
    PM25_ANNUAL: 35,
    PM25_24HR: 75,
    PM10_ANNUAL: 50,
    PM10_24HR: 100,
  },
  GHANA: {
    PM25_ANNUAL: null,
    PM25_24HR: 35,
    PM10_ANNUAL: 70,
    PM10_24HR: 70,
  },
  SOUTH_AFRICA: {
    PM25_ANNUAL: 20,
    PM25_24HR: 40,
    PM10_ANNUAL: 40,
    PM10_24HR: 75,
  },
  NIGERIA: {
    PM25_ANNUAL: 20,
    PM25_24HR: 40,
    PM10_ANNUAL: 60,
    PM10_24HR: 150,
  },
} as const;

/**
 * Source-backed ambient particulate limits shown in the standards dialog.
 * WHO values are health guidelines; the other entries are national standards.
 * A null value means the linked primary source does not provide a numeric limit.
 */
export const OFFICIAL_AIR_QUALITY_STANDARDS: Record<
  StandardsOrganization,
  OfficialAirQualityStandard
> = {
  WHO: {
    kind: 'WHO health-based guideline',
    instrument: 'WHO Global Air Quality Guidelines (2021)',
    sources: [
      {
        label: 'WHO guideline publication',
        url: 'https://www.who.int/publications/i/item/9789240034228',
      },
      {
        label: 'WHO guideline table and 99th-percentile note',
        url: 'https://iris.who.int/bitstream/handle/10665/345334/9789240034433-eng.pdf',
      },
    ],
    note: 'These are health-based guideline values, not national legal limits.',
    pollutants: {
      'PM2.5': {
        annual: 5,
        daily: 15,
        dailyExceedanceRule:
          '99th percentile of daily means (about 3–4 days/year).',
      },
      PM10: {
        annual: 15,
        daily: 45,
        dailyExceedanceRule:
          '99th percentile of daily means (about 3–4 days/year).',
      },
    },
  },
  NEMA_UGANDA: {
    kind: 'National ambient air quality standard',
    instrument:
      'National Environment (Air Quality Standards) Regulations, 2024 (S.I. No. 22)',
    sources: [
      {
        label: 'NEMA Uganda official regulations (Schedule 2, Table 1)',
        url: 'https://www.nema.go.ug/en/wp-content/uploads/2025/01/The-National-Environment-Air-Quality-Standards-Regulations-S.I.-No.-22-of-2024-1.pdf',
      },
    ],
    note: 'The schedule gives annual and 24-hour limits; it does not state a separate exceedance allowance beside these entries.',
    pollutants: {
      'PM2.5': { annual: 25, daily: 35 },
      PM10: { annual: 40, daily: 60 },
    },
  },
  NEMA_KENYA: {
    kind: 'National ambient air quality tolerance limits',
    instrument:
      'Environmental Management and Co-ordination (Air Quality) Regulations, 2024 (L.N. 180), as amended in 2025',
    sources: [
      {
        label: 'Kenya Law consolidated text (includes 2025 amendments)',
        url: 'https://new.kenyalaw.org/akn/ke/act/ln/2024/180/eng%402025-03-24/source.pdf',
      },
      {
        label: 'NEMA Kenya gazetted regulations',
        url: 'https://nema.go.ke/wp-content/uploads/2025/07/AIR-QUALITY-AND-PLASTICS-2024.pdf',
      },
    ],
    note: 'The regulation’s PM10 entry varies by area. Chart reference lines use the residential, rural and other-area values; all three area categories are listed below. Controlled-area values carry a separate schedule footnote; consult the linked regulation for its application.',
    pollutants: {
      'PM2.5': {
        annual: 35,
        daily: 75,
        dailyExceedanceRule:
          'The PM2.5 row does not mark a separate exceedance rule; the schedule’s footnotes should be checked for the applicable site and reporting context.',
      },
      PM10: {
        annual: 50,
        daily: 100,
        dailyExceedanceRule:
          'For marked 24-hour limits, the schedule states no more than 3 exceedances/year and requires 24-hour values to be met 98% of the year, not on consecutive days.',
        context:
          'The regulation labels this pollutant “respirable particulate matter (<10 μm) (RPM)”.',
        areaLimits: [
          {
            area: 'Industrial area',
            annual: 70,
            daily: 150,
            dailyExceedanceRule:
              'No more than 3 exceedances/year; 24-hour values should be met 98% of the year and not on consecutive days.',
          },
          {
            area: 'Residential, rural and other area',
            annual: 50,
            daily: 100,
            dailyExceedanceRule:
              'No more than 3 exceedances/year; 24-hour values should be met 98% of the year and not on consecutive days.',
          },
          {
            area: 'Controlled areas',
            annual: 50,
            daily: 75,
          },
        ],
      },
    },
  },
  RWANDA: {
    kind: 'Rwanda Standard (adopted East African Standard)',
    instrument: 'RS EAS 751:2010, Air quality — Specification',
    sources: [
      {
        label: 'Rwanda Standards Board standard record',
        url: 'https://www.portal.rsb.gov.rw/webstore_view.php?i=NDk2MThGQmtOd1ozQTNw',
      },
      {
        label: 'REMA report reproducing EAS 751:2010 ambient limits',
        url: 'https://rema.gov.rw/fileadmin/templates/Documents/rema_doc/Air%20Quality/Inventory%20of%20Sources%20of%20Air%20Pollution%20in%20Rwanda%20Final%20Report..pdf',
      },
      {
        label: 'Official Gazette: compulsory Rwanda standards list',
        url: 'https://www.rsb.gov.rw/fileadmin/user_upload/Publications/Laws/MINISTERIAL_INSTRUCTIONS_N___21_2013__OF_03_07_2013_DECLARING_COMPULSORY_RWANDAN_STANDARDS.pdf',
      },
    ],
    note: 'PM10 limits vary by area. Chart reference lines use residential, rural and other-area limits; all area values are listed below. The averaging and exceedance notes follow the REMA report’s transcription of EAS 751:2010.',
    pollutants: {
      'PM2.5': {
        annual: 35,
        daily: 75,
      },
      PM10: {
        annual: 50,
        daily: 100,
        dailyExceedanceRule:
          'The REMA transcription states 24-hour values should be met 98% of the year and not be exceeded on two consecutive days.',
        context:
          'The standard requires at least 104 annual measurements, taken twice weekly at 24-hour intervals.',
        areaLimits: [
          {
            area: 'Industrial area',
            annual: 70,
            daily: 150,
            dailyExceedanceRule:
              '24-hour values should be met 98% of the year and not be exceeded on two consecutive days.',
          },
          {
            area: 'Residential, rural and other area',
            annual: 50,
            daily: 100,
            dailyExceedanceRule:
              '24-hour values should be met 98% of the year and not be exceeded on two consecutive days.',
          },
          {
            area: 'Controlled areas',
            annual: 50,
            daily: 75,
          },
        ],
      },
    },
  },
  GHANA: {
    kind: 'Ghana Standard for ambient air quality',
    instrument:
      'GS 1236:2019, Environment and Health Protection — Requirements for Ambient Air Quality and Point Source/Stack Emissions',
    sources: [
      {
        label: 'Ghana Standards Authority standard record',
        url: 'https://webstore.gsa.gov.gh/detail.php?ID=1896',
      },
      {
        label: 'Ghana EPA project document reproducing GS 1236:2019 limits',
        url: 'https://ehpmp.epa.gov.gh/wp-content/uploads/2025/07/Final-ESMP-for-Tinga-13.06.2025.pdf',
      },
      {
        label: 'Ghana Parliament update on air-quality regulation',
        url: 'https://www.parliament.gh/news?CO=325',
      },
    ],
    note: 'These values are from GS 1236:2019. The standard specifies a 24-hour PM2.5 limit but no annual PM2.5 limit. Parliament reported that a new air-quality regulation passed in July 2026; I could not verify its gazetted text, so this entry reports the published standard values.',
    pollutants: {
      'PM2.5': {
        annual: null,
        daily: 35,
      },
      PM10: {
        annual: 70,
        daily: 70,
      },
    },
  },
  SOUTH_AFRICA: {
    kind: 'National ambient air quality standard',
    instrument:
      'NEM:AQA standards: Government Notice 1210 of 2009 (PM10) and Government Notice 486 of 2012 (PM2.5)',
    sources: [
      {
        label:
          'South African Government Gazette: PM10 standard (GN 1210 of 2009)',
        url: 'https://www.gov.za/sites/default/files/gcis_document/201409/328161210.pdf',
      },
      {
        label:
          'South African Government Gazette: PM2.5 standard (GN 486 of 2012)',
        url: 'https://www.gov.za/sites/default/files/gcis_document/201409/35463gon486.pdf',
      },
    ],
    note: 'Current PM2.5 phase applies through 31 December 2029; stricter limits take effect on 1 January 2030.',
    pollutants: {
      'PM2.5': {
        annual: 20,
        daily: 40,
        annualExceedanceRule: '0 exceedances/year.',
        dailyExceedanceRule: 'Up to 4 exceedances/year.',
        nextPhase: {
          effectiveDate: '2030-01-01',
          starts: '1 January 2030',
          annual: 15,
          daily: 25,
        },
      },
      PM10: {
        annual: 40,
        daily: 75,
        annualExceedanceRule: '0 exceedances/year.',
        dailyExceedanceRule: 'Up to 4 exceedances/year.',
      },
    },
  },
  NIGERIA: {
    kind: 'NESREA national ambient air quality standard',
    instrument:
      'National Environmental (Air Quality Control) Regulations (NESREA listing: S.I. No. 88 of 2021, amended)',
    sources: [
      {
        label: 'NESREA regulations listing',
        url: 'https://nesrea.gov.ng/laws-regulations/',
      },
      {
        label:
          'Official Gazette No. 161 of 2021, S.I. No. 88 (Schedule XIII; hosted by FAOLEX)',
        url: 'https://faolex.fao.org/docs/pdf/nig225821.pdf',
      },
    ],
    note: 'NESREA’s catalogue labels the instrument “amended,” but I could not locate an accessible amended Gazette text to verify whether its limits changed. The values shown here are transcribed from Schedule XIII of the 2021 Gazette. The separate PDF currently linked from NESREA appears to contain older, mixed text.',
    pollutants: {
      'PM2.5': {
        annual: 20,
        daily: 40,
      },
      PM10: {
        annual: 60,
        daily: 150,
        dailyExceedanceRule:
          'Schedule XIII does not specify a separate permissible-exceedance allowance beside this value.',
      },
    },
  },
} as const;

export const getCurrentAirQualityLimits = (
  organization: StandardsOrganization,
  pollutant: StandardPollutant,
  asOf = new Date()
): AirQualityLimitSet => {
  const limits =
    OFFICIAL_AIR_QUALITY_STANDARDS[organization].pollutants[pollutant];
  const nextPhase = limits.nextPhase;

  if (!nextPhase) return limits;

  const [year, month, day] = nextPhase.effectiveDate.split('-').map(Number);
  const effectiveDate = new Date(year, month - 1, day).getTime();
  const currentDate = new Date(
    asOf.getFullYear(),
    asOf.getMonth(),
    asOf.getDate()
  ).getTime();

  if (currentDate < effectiveDate) return limits;

  return {
    ...limits,
    annual: nextPhase.annual,
    daily: nextPhase.daily,
    nextPhase: undefined,
  };
};

export const getCurrentReferenceLines = (
  organization: StandardsOrganization,
  asOf = new Date()
) => {
  const pm25 = getCurrentAirQualityLimits(organization, 'PM2.5', asOf);
  const pm10 = getCurrentAirQualityLimits(organization, 'PM10', asOf);

  return {
    PM25_ANNUAL: pm25.annual,
    PM25_24HR: pm25.daily,
    PM10_ANNUAL: pm10.annual,
    PM10_24HR: pm10.daily,
  };
};

// Default standards (WHO PM2.5 for backward compatibility)
export const AIR_QUALITY_STANDARDS = WHO_PM25_STANDARDS;

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get air quality level based on pollutant value and type
 * @param value - Pollutant concentration value
 * @param pollutant - Pollutant type (default: pm2_5)
 * @returns Air quality level
 */
export const getAirQualityLevel = (
  value: number | null | undefined,
  pollutant: PollutantType = 'pm2_5',
  config: AqiConfig | null = getActiveAqiConfigForPollutant(pollutant)
): AirQualityLevel => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'no-value';
  }

  if (!config) {
    return 'no-value';
  }

  const orderedRanges = [...config.ranges].sort(
    (a, b) => a.min_value - b.min_value
  );
  const range =
    orderedRanges.find(
      item =>
        value >= item.min_value &&
        (item.max_value === null || value <= item.max_value)
    ) ??
    // A valid server configuration may leave small decimal gaps between bands.
    // Attribute those readings to the closest lower configured band.
    [...orderedRanges].reverse().find(item => value >= item.min_value);

  if (!range) {
    return 'no-value';
  }

  return getAirQualityLevelForRangeKey(range.key);
};

/**
 * Get color for air quality level
 * @param level - Air quality level
 * @returns Hex color string
 */
export const getAirQualityColor = (
  level: AirQualityLevel,
  config: AqiConfig | null = activeAqiConfig
): string => {
  return (
    getAqiRangeForLevel(level, config)?.color || AIR_QUALITY_COLORS['no-value']
  );
};

/**
 * Get icon component for air quality level
 * @param level - Air quality level
 * @returns React component for the icon
 */
export const getAirQualityIcon = (
  level: AirQualityLevel
): ComponentType<{ className?: string }> => {
  return AIR_QUALITY_ICONS[level] || AIR_QUALITY_ICONS['no-value'];
};

export const getAirQualityIconForRangeKey = (key: AqiRangeKey) =>
  getAirQualityIcon(getAirQualityLevelForRangeKey(key));

/**
 * Get air quality threshold data by level using shared standards
 * @param level - Air quality level
 * @param organization - Standards organization (default: WHO)
 * @param pollutant - Pollutant type (default: PM2.5)
 * @returns Threshold configuration
 */
export const getAirQualityThreshold = (
  level: AirQualityLevel,
  organization: StandardsOrganization = 'WHO',
  pollutant: 'PM2.5' | 'PM10' = 'PM2.5'
): AirQualityStandard | undefined => {
  const levelMapping: Record<AirQualityLevel, string> = {
    good: 'Good',
    moderate: 'Moderate',
    'unhealthy-sensitive-groups': 'Unhealthy for Sensitive Groups',
    unhealthy: 'Unhealthy',
    'very-unhealthy': 'Very Unhealthy',
    hazardous: 'Hazardous',
    'no-value': '',
  };

  const standardLevel = levelMapping[level];

  const standards = getStandardsByType(organization, pollutant);
  return standards.find(std => std.level === standardLevel);
};

/**
 * Get human-readable label for air quality level
 * @param level - Air quality level
 * @param organization - Standards organization (default: WHO)
 * @param pollutant - Pollutant type (default: PM2.5)
 * @returns Human readable label
 */
export const getAirQualityLabel = (
  level: AirQualityLevel,
  organization: StandardsOrganization = 'WHO',
  pollutant: 'PM2.5' | 'PM10' = 'PM2.5',
  config: AqiConfig | null = getActiveAqiConfigForPollutant(
    pollutant === 'PM10' ? 'pm10' : 'pm2_5'
  )
): string => {
  const configuredLabel = getAqiRangeForLevel(level, config)?.label;
  if (configuredLabel) return configuredLabel;

  const threshold = getAirQualityThreshold(level, organization, pollutant);
  return threshold?.level || 'No Data';
};

/**
 * Get complete air quality information for a given value
 * @param value - Pollutant concentration value
 * @param pollutant - Pollutant type (default: pm2_5)
 * @param organization - Standards organization (default: WHO)
 * @returns Complete air quality information object
 */
export const getAirQualityInfo = (
  value: number | null | undefined,
  pollutant: PollutantType = 'pm2_5',
  organization: StandardsOrganization = 'WHO',
  config: AqiConfig | null = getActiveAqiConfigForPollutant(pollutant)
): AirQualityInfo => {
  const level = getAirQualityLevel(value, pollutant, config);

  // Map pollutant types to display formats for threshold lookups
  const pollutantDisplayMap: Record<PollutantType, 'PM2.5' | 'PM10'> = {
    pm2_5: 'PM2.5',
    pm10: 'PM10',
    // TODO: Add mappings for additional pollutants when expanded
  };

  const displayType = pollutantDisplayMap[pollutant];

  return {
    level,
    label: getAirQualityLabel(level, organization, displayType, config),
    icon: getAirQualityIcon(level),
    description: getAirQualityThreshold(level, organization, displayType)
      ?.description,
  };
};

/**
 * Map an incoming `aqi_category` string to the internal AirQualityLevel keys
 * Handles several formatting variants (spaces, camelCase, different naming)
 * @param category - Raw category string from API
 * @returns Standardized air quality level
 */
export const mapAqiCategoryToLevel = (category?: string): AirQualityLevel => {
  if (!category || typeof category !== 'string') return 'no-value';

  const normalized = category.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  const configuredRange = activeAqiConfig?.ranges.find(
    range =>
      range.label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === normalized ||
      range.key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === normalized
  );
  if (configuredRange) {
    return getAirQualityLevelForRangeKey(configuredRange.key);
  }

  switch (normalized) {
    case 'good':
    case 'goodair':
      return 'good';
    case 'moderate':
    case 'moderateair':
      return 'moderate';
    case 'unhealthyforsensitivegroups':
    case 'unhealthyforsensitivegroup':
    case 'unhealthyforsensitive':
    case 'u4sg':
      return 'unhealthy-sensitive-groups';
    case 'unhealthy':
      return 'unhealthy';
    case 'veryunhealthy':
    case 'veryunhealthyair':
      return 'very-unhealthy';
    case 'hazardous':
      return 'hazardous';
    case 'invalid':
      return 'no-value';
    default:
      return 'no-value';
  }
};

/**
 * Get standards by organization and pollutant type
 * @param organization - Standards organization
 * @param pollutant - Pollutant type
 * @returns Array of air quality standards
 */
export const getStandardsByType = (
  organization: StandardsOrganization,
  pollutant: 'PM2.5' | 'PM10'
): AirQualityStandard[] => {
  switch (organization) {
    case 'WHO':
      return pollutant === 'PM10' ? WHO_PM10_STANDARDS : WHO_PM25_STANDARDS;
    case 'NEMA_UGANDA':
      return pollutant === 'PM10' ? NEMA_PM10_STANDARDS : NEMA_PM25_STANDARDS;
    case 'NEMA_KENYA':
      return pollutant === 'PM10'
        ? NEMA_KENYA_PM10_STANDARDS
        : NEMA_KENYA_PM25_STANDARDS;
    case 'RWANDA':
    case 'GHANA':
      // Neither standard defines the app's named health-category bands.
      return [];
    case 'SOUTH_AFRICA':
      return pollutant === 'PM10'
        ? SOUTH_AFRICA_PM10_STANDARDS
        : SOUTH_AFRICA_PM25_STANDARDS;
    case 'NIGERIA':
      return pollutant === 'PM10'
        ? NIGERIA_PM10_STANDARDS
        : NIGERIA_PM25_STANDARDS;
  }
};

/**
 * Standards organization options for UI components
 */
export const STANDARDS_ORGANIZATIONS = {
  WHO: 'WHO (World Health Organization)',
  NEMA_UGANDA: 'NEMA (Uganda)',
  NEMA_KENYA: 'NEMA (Kenya)',
  RWANDA: 'Rwanda (RSB/EAS)',
  GHANA: 'Ghana (GS 1236:2019)',
  SOUTH_AFRICA: 'South Africa (NEM:AQA)',
  NIGERIA: 'Nigeria (NESREA)',
} as const;

/**
 * Pollutant display labels
 */
export const POLLUTANT_LABELS = {
  pm2_5: 'PM₂.₅',
  pm10: 'PM₁₀',
  // TODO: Add labels for additional pollutants when expanded:
  // no2: 'NO₂', o3: 'O₃', co: 'CO', so2: 'SO₂'
} as const;

/**
 * Get pollutant display label
 * @param pollutant - Pollutant type
 * @returns Display label with proper formatting
 */
export const getPollutantLabel = (pollutant: PollutantType): string => {
  return POLLUTANT_LABELS[pollutant] || pollutant.toUpperCase();
};

// ========================================
// US EPA AQI CATEGORIES (24-HOUR)
// ========================================

/**
 * Canonical US EPA AQI categories for 24-hour averaging — the authoritative
 * breakpoint boundaries for each pollutant, including the AQI index range of
 * every category. These are fixed public EPA values; they are NOT derived
 * from the deployed aqi-ranges configuration (which may follow a different
 * reference standard such as WHO).
 */
export interface EpaAqiCategory {
  key: AqiRangeKey;
  label: string;
  /** Concentration band in μg/m³ (null max = open-ended) */
  concMin: number;
  concMax: number | null;
  /** US EPA AQI index band (null max = open-ended) */
  aqiMin: number;
  aqiMax: number | null;
}

export const EPA_AQI_CATEGORIES: Record<'pm2_5' | 'pm10', EpaAqiCategory[]> = {
  pm2_5: [
    {
      key: 'good',
      label: 'Good',
      concMin: 0,
      concMax: 9.0,
      aqiMin: 0,
      aqiMax: 50,
    },
    {
      key: 'moderate',
      label: 'Moderate',
      concMin: 9.1,
      concMax: 35.4,
      aqiMin: 51,
      aqiMax: 100,
    },
    {
      key: 'u4sg',
      label: 'Unhealthy for Sensitive Groups',
      concMin: 35.5,
      concMax: 55.4,
      aqiMin: 101,
      aqiMax: 150,
    },
    {
      key: 'unhealthy',
      label: 'Unhealthy',
      concMin: 55.5,
      concMax: 125.4,
      aqiMin: 151,
      aqiMax: 200,
    },
    {
      key: 'very_unhealthy',
      label: 'Very Unhealthy',
      concMin: 125.5,
      concMax: 225.4,
      aqiMin: 201,
      aqiMax: 300,
    },
    {
      key: 'hazardous',
      label: 'Hazardous',
      concMin: 225.5,
      concMax: null,
      aqiMin: 301,
      aqiMax: null,
    },
  ],
  pm10: [
    {
      key: 'good',
      label: 'Good',
      concMin: 0,
      concMax: 54,
      aqiMin: 0,
      aqiMax: 50,
    },
    {
      key: 'moderate',
      label: 'Moderate',
      concMin: 55,
      concMax: 154,
      aqiMin: 51,
      aqiMax: 100,
    },
    {
      key: 'u4sg',
      label: 'Unhealthy for Sensitive Groups',
      concMin: 155,
      concMax: 254,
      aqiMin: 101,
      aqiMax: 150,
    },
    {
      key: 'unhealthy',
      label: 'Unhealthy',
      concMin: 255,
      concMax: 354,
      aqiMin: 151,
      aqiMax: 200,
    },
    {
      key: 'very_unhealthy',
      label: 'Very Unhealthy',
      concMin: 355,
      concMax: 424,
      aqiMin: 201,
      aqiMax: 300,
    },
    {
      key: 'hazardous',
      label: 'Hazardous',
      concMin: 425,
      concMax: null,
      aqiMin: 301,
      aqiMax: null,
    },
  ],
};

/**
 * Classify an AQI index using the US EPA index bands. These index bands are
 * distinct from the pollutant concentration ranges used by the shared AQI
 * configuration.
 */
export const getUsAqiLevel = (
  aqiIndex: number | null | undefined
): AirQualityLevel => {
  if (
    typeof aqiIndex !== 'number' ||
    !Number.isFinite(aqiIndex) ||
    aqiIndex < 0
  ) {
    return 'no-value';
  }

  const rounded = Math.round(aqiIndex);
  const category = EPA_AQI_CATEGORIES.pm2_5.find(
    ({ aqiMin, aqiMax }) =>
      rounded >= aqiMin && (aqiMax === null || rounded <= aqiMax)
  );

  return category ? getAirQualityLevelForRangeKey(category.key) : 'no-value';
};

/**
 * Build an AQI configuration on the US index scale (0–500), preserving the
 * shared configured labels and colors. The API configuration's range bounds
 * describe pollutant concentrations and must not be used to position an AQI
 * index marker.
 */
export const getUsAqiIndexConfig = (
  config: AqiConfig | null | undefined
): AqiConfig | null => {
  if (!config) return null;

  return {
    ...config,
    ranges: EPA_AQI_CATEGORIES.pm2_5.map((category, index) => {
      const configuredRange = config.ranges.find(
        range => range.key === category.key
      );

      return {
        key: category.key,
        label: configuredRange?.label ?? category.label,
        min_value: category.aqiMin,
        max_value: category.aqiMax ?? 500,
        color: configuredRange?.color ?? '',
        color_name: configuredRange?.color_name,
        display_order: index + 1,
      };
    }),
  };
};

/**
 * Interpret the API's numeric AQI index using the US EPA index bands.
 */
export const getUsAqiInfo = (
  aqiIndex: number | null | undefined,
  config: AqiConfig | null = null
): AirQualityInfo | null => {
  if (
    typeof aqiIndex !== 'number' ||
    !Number.isFinite(aqiIndex) ||
    aqiIndex < 0
  ) {
    return null;
  }

  const level = getUsAqiLevel(aqiIndex);
  if (level === 'no-value') return null;

  const epaCategory = EPA_AQI_CATEGORIES.pm2_5.find(
    item => getAirQualityLevelForRangeKey(item.key) === level
  );

  return {
    level,
    label:
      getAqiRangeForLevel(level, config)?.label ??
      epaCategory?.label ??
      'No Data',
    icon: getAirQualityIcon(level),
  };
};
