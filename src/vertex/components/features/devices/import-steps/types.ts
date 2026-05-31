export interface ImportDeviceFormData {
  long_name: string;
  network: string;
  category: string;
  serial_number: string;
  description: string;
  device_number: string;
  writeKey: string;
  readKey: string;
  api_code: string;
  authRequired: boolean;
  tags: string[];
}

export interface ExpectedField {
  key: string;
  label: string;
  required: boolean;
}

export const EXPECTED_FIELDS: ExpectedField[] = [
  { key: 'long_name', label: 'Device Name', required: true },
  { key: 'serial_number', label: 'Serial Number', required: true },
  { key: 'authRequired', label: 'Authentication Required', required: true },
  { key: 'latitude', label: 'Latitude', required: false },
  { key: 'longitude', label: 'Longitude', required: false },
  { key: 'api_code', label: 'Device Connection URL', required: false },
  { key: 'description', label: 'Description', required: false },
  { key: 'device_number', label: 'Device Number', required: false },
];
