/**
 * Chart Constants
 *
 * This file contains chart-specific constants and re-exports air quality utilities
 * from the centralized airQuality utility for backward compatibility.
 */

// Re-export air quality utilities from shared utils for backward compatibility
export {
  WHO_PM25_STANDARDS,
  WHO_PM10_STANDARDS,
  NEMA_PM25_STANDARDS,
  NEMA_PM10_STANDARDS,
  AIR_QUALITY_STANDARDS,
  AIR_QUALITY_ICONS,
  TREND_ICONS,
  POLLUTANT_RANGES,
  AQ_STANDARDS,
  REFERENCE_LINES,
  STANDARDS_ORGANIZATIONS,
  POLLUTANT_LABELS,
  type AirQualityStandard,
} from '@/shared/utils/airQuality';

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

export const DATA_TYPE_LABELS = {
  calibrated: 'Calibrated',
  raw: 'Raw',
} as const;
