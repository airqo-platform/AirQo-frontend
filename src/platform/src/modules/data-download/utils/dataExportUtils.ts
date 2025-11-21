import { removeUnderscores, normalizeText } from '@/shared/lib/utils';
import {
  CohortSitesResponse,
  CohortDevicesResponse,
  GridsSummaryResponse,
} from '@/shared/types/api';
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
 * Processes grids data for table display (countries and cities)
 */
export const processGridsData = (
  gridsData: GridsSummaryResponse['grids'] | undefined
): TableItem[] => {
  if (!gridsData) return [];

  return gridsData.map((grid, index) => ({
    ...grid,
    id: String(grid._id || index),
    name: normalizeText(removeUnderscores(grid.long_name || grid.name || '--')),
    admin_level: grid.admin_level,
    network: grid.network,
    numberOfSites: grid.numberOfSites,
    sites: grid.sites, // Keep sites data for selection
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

/**
 * Creates sites data for visualization from selected grid IDs (countries/cities)
 */
export const createSitesFromGridsForVisualization = (
  gridIds: string[],
  gridsData: TableItem[]
) => {
  const allSites: Array<{
    _id: string;
    name: string;
    search_name: string;
    country: string;
  }> = [];

  gridIds.forEach(gridId => {
    const grid = gridsData.find(item => String(item.id) === gridId);
    if (grid?.sites) {
      const sites = grid.sites as Array<{
        _id: string;
        name: string;
        search_name?: string;
        location_name?: string;
        country: string;
      }>;

      sites.forEach(site => {
        allSites.push({
          _id: site._id,
          name: normalizeText(site.name || site.search_name || '--'),
          search_name:
            site.name || site.search_name || site.location_name || '--',
          country: site.country,
        });
      });
    }
  });

  return allSites;
};
