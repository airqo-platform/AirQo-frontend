/**
 * Utility functions for normalizing device data from API responses
 */

// Raw device data from API response
export interface RawDeviceData {
  _id: string;
  groups?: unknown[];
  long_name?: string;
  lastRawData?: string;
  rawOnlineStatus?: boolean;
  [key: string]: unknown;
}

// Normalized device data for table display
export interface NormalizedDeviceData {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'unknown';
  lastData: string;
  // Include raw data for access to other properties if needed
  _raw?: RawDeviceData;
  // Add index signature to make it compatible with TableItem
  [key: string]: unknown;
}

/**
 * Normalizes a single device object for table display
 * @param device Raw device data from API
 * @returns Normalized device data
 */
export const normalizeDeviceData = (
  device: RawDeviceData
): NormalizedDeviceData => {
  // Extract device name with fallback
  const name = device.long_name || device._id || 'Unknown Device';

  // Determine status based on rawOnlineStatus
  const status =
    device.rawOnlineStatus === true
      ? 'online'
      : device.rawOnlineStatus === false
        ? 'offline'
        : 'unknown';

  // Format last data timestamp
  const lastData = device.lastRawData
    ? new Date(device.lastRawData).toLocaleString()
    : 'Never';

  return {
    id: device._id,
    name: name,
    status: status,
    lastData: lastData,
    _raw: device, // Keep original data for reference
  };
};

/**
 * Normalizes an array of devices for table display
 * @param devices Array of raw device data from API
 * @returns Array of normalized device data
 */
export const normalizeDevicesData = (
  devices: RawDeviceData[]
): NormalizedDeviceData[] => {
  return devices.map(normalizeDeviceData);
};

/**
 * Utility to get display value for a device property with fallbacks
 * @param device Raw device data
 * @param property Property to extract
 * @returns Display value with appropriate fallback
 */
export const getDeviceDisplayValue = (
  device: RawDeviceData,
  property: 'name' | 'status' | 'lastData'
): string => {
  switch (property) {
    case 'name':
      return device.long_name || device._id || 'Unknown Device';
    case 'status':
      if (device.rawOnlineStatus === true) return 'online';
      if (device.rawOnlineStatus === false) return 'offline';
      return 'unknown';
    case 'lastData':
      return device.lastRawData
        ? new Date(device.lastRawData).toLocaleString()
        : 'Never';
    default:
      return 'Unknown';
  }
};

/**
 * Type guard to check if an object has the required device properties
 * @param obj Object to check
 * @returns True if object has required device properties
 */
export const isValidDeviceData = (obj: unknown): obj is RawDeviceData => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '_id' in obj &&
    typeof (obj as RawDeviceData)._id === 'string'
  );
};
