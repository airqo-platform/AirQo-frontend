export const DEFAULT_SELECTED_POLLUTANTS = ['pm2_5'];

export const DEVICE_CATEGORY_OPTIONS = [
  { value: 'lowcost', label: 'Low Cost' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'gas', label: 'Gas' },
  { value: 'bam', label: 'BAM' },
] as const;

export const DATA_TYPE_OPTIONS = [
  { value: 'raw', label: 'Raw' },
  { value: 'calibrated', label: 'Calibrated' },
] as const;

export const FREQUENCY_OPTIONS = [
  { value: 'raw', label: 'Raw' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
] as const;

export const FILE_TYPE_OPTIONS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
] as const;

export const POLLUTANT_OPTIONS = [
  { value: 'pm2_5', label: 'PM2.5' },
  { value: 'pm10', label: 'PM10' },
  { value: 'no2', label: 'NO2' },
  { value: 'so2', label: 'SO2' },
  { value: 'o3', label: 'O3' },
  { value: 'co', label: 'CO' },
] as const;

export const DEFAULT_TAB_STATE = {
  page: 1,
  pageSize: 10,
  search: '',
} as const;

export const LARGE_DATE_RANGE_THRESHOLD = 90;
