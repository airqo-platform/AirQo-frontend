export const DEFAULT_SELECTED_POLLUTANTS = ['pm2_5'];

export const DEVICE_CATEGORY_OPTIONS = [
  { value: 'lowcost', label: 'Low Cost Sensor' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'gas', label: 'Gas' },
  { value: 'bam', label: 'Reference Monitor' },
] as const;

export const DATA_TYPE_OPTIONS = [
  { value: 'raw', label: 'Raw' },
  { value: 'averaged', label: 'Averaged' },
  { value: 'calibrated', label: 'Calibrated' },
  { value: 'consolidated', label: 'Consolidated' },
] as const;

export const FREQUENCY_OPTIONS = [
  { value: 'raw', label: 'Raw' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export const FILE_TYPE_OPTIONS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
] as const;

export const POLLUTANT_OPTIONS = [
  { value: 'pm2_5', label: 'PM2.5' },
  { value: 'pm10', label: 'PM10' },
] as const;

export const DEFAULT_TAB_STATE = {
  page: 1,
  pageSize: 10,
  search: '',
} as const;

/**
 * Default analytics API window limits by export frequency.
 *
 * These mirror the analytics service defaults: raw and aggregation requests
 * are limited to 31 days, hourly requests to 90 days, and daily/coarser
 * requests to the general 365-day maximum.
 */
export const DATA_EXPORT_DATE_RANGE_LIMITS = {
  raw: 31,
  hourly: 90,
  daily: 365,
  weekly: 365,
  monthly: 365,
  yearly: 365,
} as const;

export const DEFAULT_DATA_EXPORT_DATE_RANGE_LIMIT = 365;

export const getDataExportDateRangeLimit = (frequency: string): number =>
  DATA_EXPORT_DATE_RANGE_LIMITS[
    frequency as keyof typeof DATA_EXPORT_DATE_RANGE_LIMITS
  ] ?? DEFAULT_DATA_EXPORT_DATE_RANGE_LIMIT;

export const getDataExportFrequencyLabel = (frequency: string): string =>
  FREQUENCY_OPTIONS.find(option => option.value === frequency)?.label ??
  frequency;
