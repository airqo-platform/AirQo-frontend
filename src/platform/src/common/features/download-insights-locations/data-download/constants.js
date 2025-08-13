export const POLLUTANT_OPTIONS = [
  { id: 1, name: 'PM2.5' },
  { id: 2, name: 'PM10' },
  // { id: 3, name: 'CO' },
  // { id: 4, name: 'SO2' },
  // { id: 5, name: 'NO2' },
];

export const DATA_TYPE_OPTIONS = [
  { id: 1, name: 'Calibrated Data', value: 'calibrated' },
  { id: 2, name: 'Raw Data', value: 'raw' },
];

export const FREQUENCY_OPTIONS = [
  { id: 1, name: 'Daily', value: 'daily' },
  { id: 2, name: 'Hourly', value: 'hourly' },
  { id: 3, name: 'Weekly', value: 'weekly' },
  { id: 4, name: 'Monthly', value: 'monthly' },
  { id: 5, name: 'Raw', value: 'raw' },
];

export const FILE_TYPE_OPTIONS = [
  { id: 1, name: 'CSV', value: 'csv' },
  { id: 2, name: 'JSON', value: 'json' },
  // { id: 3, name: 'PDF', value: 'pdf' },
];

export const DEVICE_CATEGORY_OPTIONS = [
  { id: 1, name: 'lowcost' },
  { id: 2, name: 'bam' },
  { id: 3, name: 'mobile' },
];

// Filter type constants
export const FILTER_TYPES = {
  COUNTRIES: 'countries',
  CITIES: 'cities',
  SITES: 'sites',
  DEVICES: 'devices',
};

// Constants
export const MESSAGE_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};
