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

export const LARGE_DATE_RANGE_THRESHOLD = 90;
