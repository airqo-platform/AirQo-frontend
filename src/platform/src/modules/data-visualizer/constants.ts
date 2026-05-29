import type { AggregationMethod, VisualizerChartType } from './types';
export {
  getPrimaryColor,
  getPrimaryColors,
} from '@/shared/components/charts/constants';

export const MAX_UPLOAD_FILE_SIZE_BYTES = 100 * 1024 * 1024;
export const MAX_VISUALIZER_ROWS = 50000;
export const MAX_CHART_RENDER_ROWS = 5000;
export const UPLOAD_CANCEL_WARN_MS = 8000;

export const CHART_TYPE_LABELS: Record<VisualizerChartType, string> = {
  line: 'Line',
  area: 'Area',
  bar: 'Bar',
  composed: 'Composed',
  scatter: 'Scatter',
  histogram: 'Histogram',
  pie: 'Category share',
  radar: 'Radar',
  map: 'Map',
};

export const CHART_TYPE_HELP: Record<VisualizerChartType, string> = {
  line: 'Time trends and site/device comparisons.',
  area: 'Pollution load over time.',
  bar: 'Averages across sites, devices, cities, or other groups.',
  composed: 'Compare two measures on one time axis.',
  scatter: 'Correlation between two numeric fields.',
  histogram: 'Distribution of concentration values.',
  pie: 'Share by air quality band or selected group.',
  radar: 'Profile top groups across one or two measures.',
  map: 'Spatial distribution from latitude and longitude fields.',
};

export const AGGREGATION_LABELS: Record<AggregationMethod, string> = {
  average: 'Average',
  sum: 'Sum',
  min: 'Minimum',
  max: 'Maximum',
  count: 'Count',
};

export const COLOR_PICKER_FALLBACKS = [
  '#145fff',
  '#0b4bd4',
  '#5b8cff',
  '#0f766e',
  '#f97316',
  '#7c3aed',
  '#dc2626',
  '#0891b2',
  '#65a30d',
  '#be123c',
  '#ca8a04',
  '#4f46e5',
];

export const SOURCE_COLUMN_KEYS = {
  INTERNAL: {
    dataset: '__source_dataset',
    file: '__source_file',
    sheet: '__source_sheet',
  },
} as const;

type InternalSourceColumnKey =
  (typeof SOURCE_COLUMN_KEYS.INTERNAL)[keyof typeof SOURCE_COLUMN_KEYS.INTERNAL];

export const SOURCE_COLUMN_LABELS: Record<InternalSourceColumnKey, string> = {
  [SOURCE_COLUMN_KEYS.INTERNAL.dataset]: 'Dataset',
  [SOURCE_COLUMN_KEYS.INTERNAL.file]: 'Source file',
  [SOURCE_COLUMN_KEYS.INTERNAL.sheet]: 'Workbook sheet',
};

export const AIR_QUALITY_CATEGORY_COLORS = {
  Good: '#22c55e',
  Moderate: '#eab308',
  'Unhealthy for Sensitive Groups': '#f97316',
  Unhealthy: '#ef4444',
  'Very Unhealthy': '#8b5cf6',
  Hazardous: '#7f1d1d',
};
