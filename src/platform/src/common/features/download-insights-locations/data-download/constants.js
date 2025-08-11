export const POLLUTANT_OPTIONS = [
  { id: 1, name: 'PM2.5' },
  { id: 2, name: 'PM10' },
  // { id: 3, name: 'CO' },
  // { id: 4, name: 'SO2' },
  // { id: 5, name: 'NO2' },
];

export const DATA_TYPE_OPTIONS = [
  { id: 1, name: 'Calibrated Data' },
  { id: 2, name: 'Raw Data' },
];

export const FREQUENCY_OPTIONS = [
  { id: 1, name: 'Daily' },
  { id: 2, name: 'Hourly' },
  { id: 3, name: 'Weekly' },
  { id: 4, name: 'Monthly' },
];

export const FILE_TYPE_OPTIONS = [
  { id: 1, name: 'CSV' },
  { id: 2, name: 'Json' },
  // { id: 3, name: 'PDF' },
];

export const DEVICE_CATEGORY_OPTIONS = [
  { id: 1, name: 'lowcost' },
  { id: 2, name: 'bam' },
  { id: 3, name: 'mobile' },
];

// Constants
export const MESSAGE_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};
