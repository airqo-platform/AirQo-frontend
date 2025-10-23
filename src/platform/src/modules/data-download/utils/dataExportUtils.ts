import { removeUnderscores, normalizeText } from '@/shared/lib/utils';
import { CohortSitesResponse, CohortDevicesResponse } from '@/shared/types/api';
import { TableItem } from '../types/dataExportTypes';

/**
 * Processes sites data for table display
 */
export const processSitesData = (
  sitesData: CohortSitesResponse['sites'] | undefined
): TableItem[] => {
  if (!sitesData) return [];

  return sitesData.map((site, index) => ({
    ...site,
    id:
      (site.site_id as string | number) ||
      (site._id as string | number) ||
      index,
    name: normalizeText(removeUnderscores((site.name as string) || '--')),
    city: removeUnderscores((site.city as string) || '--'),
    country: removeUnderscores((site.country as string) || '--'),
    data_provider: removeUnderscores(
      (site.data_provider as string) || '--'
    ).toUpperCase(),
  }));
};

/**
 * Processes devices data for table display
 */
export const processDevicesData = (
  devicesData: CohortDevicesResponse['devices'] | undefined
): TableItem[] => {
  if (!devicesData) return [];

  return devicesData.map((device, index) => ({
    ...device,
    id:
      (device.device_id as string | number) ||
      (device._id as string | number) ||
      index,
    name: (device.name as string) || '--',
    network: ((device.network as string) || '--').toUpperCase(),
    category: (device.category as string) || '--',
  }));
};

/**
 * Gets default date range (last 7 days)
 */
export const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  return {
    from: startDate,
    to: endDate,
  };
};

/**
 * Maps device IDs to device names for API calls
 */
export const mapDeviceIdsToNames = (
  deviceIds: string[],
  devicesData: TableItem[]
): string[] => {
  return deviceIds
    .map(id => {
      const device = devicesData.find(item => String(item.id) === id);
      return device?.name as string;
    })
    .filter(Boolean);
};

/**
 * Creates sites data for visualization from selected site IDs
 */
export const createSitesForVisualization = (
  siteIds: string[],
  sitesData: TableItem[]
) => {
  return siteIds.map(siteId => {
    const site = sitesData.find(item => String(item.id) === siteId);
    return {
      _id: siteId,
      name: normalizeText((site?.name as string) || '--'),
      search_name: site?.name as string,
      country: site?.country as string,
    };
  });
};

/**
 * Creates sites data for visualization from selected device IDs
 */
export const createSitesFromDevicesForVisualization = (
  deviceIds: string[],
  devicesData: TableItem[]
) => {
  return deviceIds.map(deviceId => {
    const device = devicesData.find(item => String(item.id) === deviceId);
    const site = device?.site as Record<string, unknown>;

    return {
      _id: (site?._id as string) || deviceId,
      name: normalizeText((site?.name as string) || '--'),
      search_name: (site?.search_name as string) || (site?.name as string),
      country: site?.country as string,
      device_name: normalizeText((device?.name as string) || '--'),
    };
  });
};
