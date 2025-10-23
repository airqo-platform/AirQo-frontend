import { AirQualityStandard } from '../types';
// Air quality icon mapping
import {
  AqGood,
  AqHazardous,
  AqModerate,
  AqNoValue,
  AqUnhealthy,
  AqUnhealthyForSensitiveGroups,
  AqVeryUnhealthy,
} from '@airqo/icons-react';
import { HiMinus } from 'react-icons/hi';
import { AqArrowDown, AqArrowUp } from '@airqo/icons-react';

export const WHO_PM25_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 5 },
    color: '#10B981', // green-500
    description: 'WHO Annual guideline (5 µg/m³) - Minimal health risk',
  },
  {
    level: 'Moderate',
    range: { min: 5, max: 15 },
    color: '#F59E0B', // amber-500
    description: 'Above WHO annual but below WHO 24-hour guideline',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 15, max: 25 },
    color: '#EF4444', // red-500
    description: 'Sensitive groups may experience health effects',
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

// WHO Air Quality Guidelines (2021) - PM10 (µg/m³)
export const WHO_PM10_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 15 },
    color: '#10B981', // green-500
    description: 'WHO Annual guideline (15 µg/m³) - Minimal health risk',
  },
  {
    level: 'Moderate',
    range: { min: 15, max: 45 },
    color: '#F59E0B', // amber-500
    description: 'Above WHO annual but below WHO 24-hour guideline',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 45, max: 75 },
    color: '#EF4444', // red-500
    description: 'Sensitive groups may experience health effects',
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

// NEMA Uganda Air Quality Standards - PM2.5 (µg/m³)
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

// NEMA Uganda Air Quality Standards - PM10 (µg/m³)
export const NEMA_PM10_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 20 },
    color: '#10B981', // green-500
    description: 'Well below NEMA annual limit - Good air quality',
  },
  {
    level: 'Moderate',
    range: { min: 20, max: 40 },
    color: '#F59E0B', // amber-500
    description: 'Within NEMA annual limit (40 µg/m³) - Acceptable',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 40, max: 60 },
    color: '#EF4444', // red-500
    description: 'Above NEMA annual but within 24-hour limit',
  },
  {
    level: 'Unhealthy',
    range: { min: 60, max: 100 },
    color: '#8B5CF6', // violet-500
    description: 'Above NEMA 24-hour limit (60 µg/m³)',
  },
  {
    level: 'Very Unhealthy',
    range: { min: 100, max: 200 },
    color: '#DC2626', // red-600
    description: 'Significantly above NEMA limits',
  },
  {
    level: 'Hazardous',
    range: { min: 200, max: Infinity },
    color: '#7C2D12', // red-900
    description: 'Extremely high - Health emergency',
  },
];

// Default standards (WHO PM2.5 for backward compatibility)
export const AIR_QUALITY_STANDARDS = WHO_PM25_STANDARDS;

// Primary color palette - using theme primary with high contrast variations for better accessibility
export const PRIMARY_COLOR_PALETTE = [
  'rgb(var(--primary))', // Base primary color
  'color-mix(in srgb, rgb(var(--primary)), black 30%)', // Darker variation with good contrast
  'color-mix(in srgb, rgb(var(--primary)), black 50%)', // Much darker for strong distinction
  'color-mix(in srgb, rgb(var(--primary)), black 70%)', // Very dark for maximum contrast
  'color-mix(in srgb, rgb(var(--primary)), white 20%)', // Lighter but still distinct
  'color-mix(in srgb, rgb(var(--primary)), white 40%)', // Moderately light with good contrast
  'color-mix(in srgb, rgb(var(--primary)), white 65%)', // Light but visible
  'color-mix(in srgb, rgb(var(--primary)) 80%, orange 20%)', // Primary with subtle warm tint
  'color-mix(in srgb, rgb(var(--primary)) 80%, purple 20%)', // Primary with subtle cool tint
  'color-mix(in srgb, rgb(var(--primary)) 85%, teal 15%)', // Primary with subtle blue-green tint
];

/**
 * Generates a color from the primary palette based on index
 * Cycles through the palette for multiple data series
 * @param index - The index of the data series (0-based)
 * @returns CSS color string from the primary palette
 */
export const getPrimaryColor = (index: number): string => {
  return PRIMARY_COLOR_PALETTE[index % PRIMARY_COLOR_PALETTE.length];
};

/**
 * Generates multiple distinct colors from the primary palette
 * @param count - Number of colors needed
 * @returns Array of CSS color strings
 */
export const getPrimaryColors = (count: number): string[] => {
  return Array.from({ length: count }, (_, index) => getPrimaryColor(index));
};

// Air quality standards reference lines
export const REFERENCE_LINES = {
  WHO: {
    PM25_ANNUAL: 5,
    PM25_24HR: 15,
    PM10_ANNUAL: 15,
    PM10_24HR: 45,
  },
  NEMA: {
    PM25_ANNUAL: 25,
    PM25_24HR: 35,
    PM10_ANNUAL: 40,
    PM10_24HR: 60,
  },
};

// Chart type configurations
export const CHART_TYPES = {
  LINE: 'line',
  AREA: 'area',
  BAR: 'bar',
  SCATTER: 'scatter',
  RADAR: 'radar',
  PIE: 'pie',
} as const;

export const CHART_TYPE_LABELS = {
  [CHART_TYPES.LINE]: 'Line Chart',
  [CHART_TYPES.AREA]: 'Area Chart',
  [CHART_TYPES.BAR]: 'Bar Chart',
  [CHART_TYPES.SCATTER]: 'Scatter Plot',
  [CHART_TYPES.RADAR]: 'Radar Chart',
  [CHART_TYPES.PIE]: 'Pie Chart',
};

// Standards organization options
export const STANDARDS_ORGANIZATIONS = {
  WHO: 'WHO (World Health Organization)',
  NEMA: 'NEMA (Uganda)',
} as const;

// Default chart colors following the app's primary color scheme
// Use PRIMARY_COLOR_PALETTE for multiple data series, these for specific semantic meanings
export const CHART_COLORS = {
  primary: 'rgb(var(--primary))', // Base primary from theme
  secondary: 'rgb(var(--muted-foreground))', // Muted foreground
  // Semantic colors derived from primary theme for consistency
  success: 'color-mix(in srgb, rgb(var(--primary)) 70%, green 30%)',
  warning: 'color-mix(in srgb, rgb(var(--primary)) 60%, orange 40%)',
  danger: 'color-mix(in srgb, rgb(var(--primary)) 50%, red 50%)',
  info: 'color-mix(in srgb, rgb(var(--primary)) 80%, blue 20%)',
  // Utility colors for special cases only
  grid: 'rgb(226, 232, 240)',
  text: 'rgb(100, 116, 139)',
} as const;

// Default chart configurations
export const DEFAULT_CHART_CONFIG = {
  height: 400,
  margin: { top: 40, right: 0, left: 0, bottom: 10 },
  strokeWidth: 2,
  fillOpacity: 0.1,
  showGrid: true,
  showLegend: true,
  showTooltip: true,
  responsive: true,
} as const;

// Bar chart specific configurations
export const BAR_CHART_CONFIG = {
  barCategoryGap: '8%', // Gap between different categories - smaller means thicker bars
  barGap: 4, // Gap between bars within the same category
  maxBarSize: 80, // Maximum bar thickness in pixels
  minBarSize: 20, // Minimum bar thickness in pixels
} as const;

// Chart type selection thresholds
export const CHART_TYPE_THRESHOLDS = {
  // Number of data points to consider for auto chart selection
  maxPointsForScatter: 100,
  maxPointsForLine: 1000,
  minPointsForArea: 10,
  maxCategoriesForPie: 8,
} as const;

// Animation configurations
export const CHART_ANIMATIONS = {
  line: {
    animationBegin: 0,
    animationDuration: 800,
  },
  bar: {
    animationBegin: 0,
    animationDuration: 800,
  },
  area: {
    animationBegin: 0,
    animationDuration: 1000,
  },
} as const;

// Grid and axis configurations
export const GRID_CONFIG = {
  strokeDasharray: '3 3',
  stroke: 'rgb(226, 232, 240)', // border color in light mode
  strokeOpacity: 0.5,
} as const;

export const AXIS_CONFIG = {
  tick: {
    fontSize: 12,
    fill: 'rgb(100, 116, 139)', // muted-foreground
  },
  tickLine: {
    stroke: 'rgb(226, 232, 240)',
  },
  axisLine: {
    stroke: 'rgb(226, 232, 240)',
  },
} as const;

// Responsive breakpoints
export const CHART_BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
} as const;

// Filter labels
export const FREQUENCY_LABELS = {
  raw: 'Raw Data',
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
} as const;

export const POLLUTANT_LABELS = {
  pm2_5: 'PM₂.₅',
  pm10: 'PM₁₀',
} as const;

export const DATA_TYPE_LABELS = {
  calibrated: 'Calibrated',
  raw: 'Raw',
} as const;

// Pollutant ranges for air quality categorization
export const POLLUTANT_RANGES = {
  pm2_5: [
    { limit: 500.5, category: 'Invalid' },
    { limit: 225.5, category: 'Hazardous' },
    { limit: 125.5, category: 'VeryUnhealthy' },
    { limit: 55.5, category: 'Unhealthy' },
    { limit: 35.5, category: 'UnhealthyForSensitiveGroups' },
    { limit: 9.1, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  pm10: [
    { limit: 604.1, category: 'Invalid' },
    { limit: 424.1, category: 'Hazardous' },
    { limit: 354.1, category: 'VeryUnhealthy' },
    { limit: 254.1, category: 'Unhealthy' },
    { limit: 154.1, category: 'UnhealthyForSensitiveGroups' },
    { limit: 54.1, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  no2: [
    { limit: 2049.1, category: 'Invalid' },
    { limit: 1249.1, category: 'Hazardous' },
    { limit: 649.1, category: 'VeryUnhealthy' },
    { limit: 360.1, category: 'Unhealthy' },
    { limit: 100.1, category: 'UnhealthyForSensitiveGroups' },
    { limit: 53.1, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  o3: [
    { limit: 604.1, category: 'Invalid' },
    { limit: 504.1, category: 'Hazardous' },
    { limit: 404.1, category: 'VeryUnhealthy' },
    { limit: 204.1, category: 'Unhealthy' },
    { limit: 154.1, category: 'UnhealthyForSensitiveGroups' },
    { limit: 54.1, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  co: [
    { limit: 50.5, category: 'Invalid' },
    { limit: 40.5, category: 'Hazardous' },
    { limit: 30.5, category: 'VeryUnhealthy' },
    { limit: 10.5, category: 'Unhealthy' },
    { limit: 4.5, category: 'UnhealthyForSensitiveGroups' },
    { limit: 2.5, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  so2: [
    { limit: 1004.1, category: 'Invalid' },
    { limit: 804.1, category: 'Hazardous' },
    { limit: 604.1, category: 'VeryUnhealthy' },
    { limit: 304.1, category: 'Unhealthy' },
    { limit: 185.1, category: 'UnhealthyForSensitiveGroups' },
    { limit: 75.1, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
} as const;

/**
 * WHO and NEMA standard values for reference lines.
 */
export const AQ_STANDARDS = [
  {
    name: 'WHO',
    value: { pm2_5: 15, pm10: 45 },
  },
  {
    name: 'NEMA',
    value: { pm2_5: 25, pm10: 40 },
  },
] as const;

export const AIR_QUALITY_ICONS = {
  good: AqGood,
  moderate: AqModerate,
  'unhealthy-sensitive-groups': AqUnhealthyForSensitiveGroups,
  unhealthy: AqUnhealthy,
  'very-unhealthy': AqVeryUnhealthy,
  hazardous: AqHazardous,
  'no-value': AqNoValue,
} as const;

// Trend icon mapping
export const TREND_ICONS = {
  up: AqArrowUp,
  down: AqArrowDown,
  stable: HiMinus,
} as const;
