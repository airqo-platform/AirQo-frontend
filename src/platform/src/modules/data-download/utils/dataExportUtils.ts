import { removeUnderscores, normalizeText } from '@/shared/lib/utils';
import {
  CohortSitesResponse,
  CohortDevicesResponse,
  GridsSummaryResponse,
} from '@/shared/types/api';
import { TableItem } from '../types/dataExportTypes';

type SiteNameSource = {
  [key: string]: unknown;
  name?: unknown;
  search_name?: unknown;
  formatted_name?: unknown;
  location_name?: unknown;
};

const getFirstNonEmptyString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed && trimmed !== '--') {
        return trimmed;
      }
    }
  }
  return undefined;
};

const getSiteDisplayName = (site?: SiteNameSource): string => {
  const displayName =
    getFirstNonEmptyString(
      site?.name,
      site?.search_name,
      site?.formatted_name,
      site?.location_name
    ) || '--';
  return normalizeText(removeUnderscores(displayName));
};

const getSiteSearchName = (site?: SiteNameSource): string => {
  return (
    getFirstNonEmptyString(
      site?.search_name,
      site?.formatted_name,
      site?.location_name,
      site?.name
    ) || '--'
  );
};

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
    name: getSiteDisplayName(site as SiteNameSource),
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
    const siteObject = site as TableItem | undefined;
    return {
      _id: ((siteObject?._id as string) || siteId) as string,
      name: getSiteDisplayName(siteObject),
      search_name: getSiteSearchName(siteObject),
      country: (siteObject?.country as string) || '--',
      city: (siteObject?.city as string) || undefined,
      region: (siteObject?.region as string) || undefined,
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
    const site = device?.site as SiteNameSource | undefined;

    return {
      _id: (site?._id as string) || deviceId,
      name: getSiteDisplayName(site),
      search_name: getSiteSearchName(site),
      country: (site?.country as string) || '--',
      city: (site?.city as string) || undefined,
      region: (site?.region as string) || undefined,
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
        formatted_name?: string;
        location_name?: string;
        country: string;
      }>;

      sites.forEach(site => {
        allSites.push({
          _id: site._id,
          name: getSiteDisplayName(site),
          search_name: getSiteSearchName(site),
          country: site.country || '--',
        });
      });
    }
  });

  return allSites;
};
