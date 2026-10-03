import React, { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { usePostHog } from 'posthog-js/react';
import { openMoreInsights } from '@/shared/store/insightsSlice';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { trackEvent } from '@/shared/utils/analytics';
import { trackFeatureUsage } from '@/shared/utils/enhancedAnalytics';
import { useDownloadData } from '@/shared/hooks/useAnalytics';
import { DateRange } from '@/shared/components/calendar/types';
import { LARGE_DATE_RANGE_THRESHOLD } from '../constants/dataExportConstants';
import { TabType, DeviceCategory, TableItem } from '../types/dataExportTypes';
import {
  createSitesForVisualization,
  createSitesFromDevicesForVisualization,
  createSitesFromGridsForVisualization,
} from '../utils/dataExportUtils';
import {
  buildDataDownloadRequest,
  resolveGridSitesForDownload,
} from '../utils/dataExportRequest';
import { parseDownloadResponseRecords } from '../utils/dataExportFile';
import {
  getMeasurementRecords,
  getPartialDataWarning,
} from '../utils/dataAvailability';
import type {
  DataDownloadRequest,
  DataDownloadResponse,
} from '@/shared/types/api';
import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  status?: string;
  message?: string;
  data?: unknown;
  metadata?: unknown;
}

export interface PreparedDownloadResult {
  request: DataDownloadRequest;
  response: DataDownloadResponse | string;
  selectedColumnKeys?: string[];
  filenameBase: string;
  fallbackApplied: boolean;
  activeTab: TabType;
  locationCount: number;
  summaryItems: Array<{ label: string; value: string }>;
}

type MetadataRow = Record<string, unknown>;

const getRecordValue = (
  source: Record<string, unknown> | undefined,
  key: string
) => source?.[key];

const getNestedRecord = (
  value: unknown
): Record<string, unknown> | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
};

const getStringValue = (...values: unknown[]): string | null => {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed && trimmed !== '--') {
        return trimmed;
      }
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
};

const getNumberValue = (...values: unknown[]): number | null => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        continue;
      }

      const parsed = Number(trimmed);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
};

// Rejects a caller-supplied fallback name that is empty, equals the fallback
// ID, or looks like a 24-hex-char MongoDB ObjectId — a raw ID must never
// propagate into site_name / device_name.
const sanitizeFallbackName = (
  candidate?: string,
  fallbackId?: string
): string | undefined => {
  if (typeof candidate !== 'string') return undefined;
  const trimmed = candidate.trim();
  if (!trimmed || trimmed === '--') return undefined;
  if (fallbackId && trimmed === fallbackId) return undefined;
  if (/^[0-9a-f]{24}$/i.test(trimmed)) return undefined;
  return trimmed;
};

const getSelectedGridSiteIds = (
  gridId: string,
  selectedGridSites: Record<string, string[]>,
  selectedGridSiteIds: Record<string, string[]>
) => {
  if (Object.prototype.hasOwnProperty.call(selectedGridSiteIds, gridId)) {
    return selectedGridSiteIds[gridId] || [];
  }

  return selectedGridSites[gridId] || [];
};

const buildSiteMetadataRow = (
  source: Record<string, unknown> | undefined,
  fallbackId: string,
  extras: Record<string, unknown> = {},
  fallbackName?: string
): MetadataRow => {
  const nestedSite = getNestedRecord(getRecordValue(source, 'site'));
  const nestedSiteDetails = getNestedRecord(
    getRecordValue(source, 'siteDetails')
  );

  // Name fields must never fall back to a raw ID — use the caller-supplied
  // display label, then a neutral placeholder.
  const nameFallback =
    sanitizeFallbackName(fallbackName, fallbackId) || 'Unknown location';

  return {
    site_id:
      getStringValue(
        getRecordValue(source, 'site_id'),
        getRecordValue(source, '_id'),
        getRecordValue(source, 'id')
      ) || fallbackId,
    site_name:
      getStringValue(
        getRecordValue(source, 'name'),
        getRecordValue(source, 'search_name'),
        getRecordValue(source, 'formatted_name'),
        getRecordValue(source, 'location_name'),
        nestedSite?.name,
        nestedSiteDetails?.name
      ) || nameFallback,
    search_name:
      getStringValue(
        getRecordValue(source, 'search_name'),
        getRecordValue(source, 'formatted_name'),
        getRecordValue(source, 'location_name'),
        getRecordValue(source, 'name'),
        nestedSite?.search_name,
        nestedSiteDetails?.search_name
      ) || nameFallback,
    formatted_name:
      getStringValue(
        getRecordValue(source, 'formatted_name'),
        getRecordValue(source, 'search_name'),
        getRecordValue(source, 'location_name'),
        getRecordValue(source, 'name'),
        nestedSite?.formatted_name,
        nestedSiteDetails?.formatted_name
      ) || nameFallback,
    location_name:
      getStringValue(
        getRecordValue(source, 'location_name'),
        getRecordValue(source, 'search_name'),
        getRecordValue(source, 'formatted_name'),
        getRecordValue(source, 'name'),
        nestedSite?.location_name,
        nestedSiteDetails?.location_name
      ) || nameFallback,
    city: getStringValue(
      getRecordValue(source, 'city'),
      nestedSite?.city,
      nestedSiteDetails?.city
    ),
    country: getStringValue(
      getRecordValue(source, 'country'),
      nestedSite?.country,
      nestedSiteDetails?.country
    ),
    region: getStringValue(
      getRecordValue(source, 'region'),
      nestedSite?.region,
      nestedSiteDetails?.region
    ),
    district: getStringValue(
      getRecordValue(source, 'district'),
      nestedSite?.district,
      nestedSiteDetails?.district
    ),
    county: getStringValue(
      getRecordValue(source, 'county'),
      nestedSite?.county,
      nestedSiteDetails?.county
    ),
    sub_county: getStringValue(
      getRecordValue(source, 'sub_county'),
      nestedSite?.sub_county,
      nestedSiteDetails?.sub_county
    ),
    parish: getStringValue(
      getRecordValue(source, 'parish'),
      nestedSite?.parish,
      nestedSiteDetails?.parish
    ),
    data_provider: getStringValue(
      getRecordValue(source, 'data_provider'),
      nestedSite?.data_provider,
      nestedSiteDetails?.data_provider
    ),
    latitude: getNumberValue(
      getRecordValue(source, 'latitude'),
      getRecordValue(source, 'approximate_latitude'),
      nestedSite?.latitude,
      nestedSite?.approximate_latitude,
      nestedSiteDetails?.latitude,
      nestedSiteDetails?.approximate_latitude
    ),
    longitude: getNumberValue(
      getRecordValue(source, 'longitude'),
      getRecordValue(source, 'approximate_longitude'),
      nestedSite?.longitude,
      nestedSite?.approximate_longitude,
      nestedSiteDetails?.longitude,
      nestedSiteDetails?.approximate_longitude
    ),
    ...extras,
  };
};

const buildDeviceMetadataRow = (
  source: Record<string, unknown> | undefined,
  fallbackId: string,
  fallbackName?: string
): MetadataRow => {
  const nestedSite = getNestedRecord(getRecordValue(source, 'site'));
  const nestedSiteDetails = getNestedRecord(
    getRecordValue(source, 'siteDetails')
  );

  // Name fields must never fall back to a raw ID.
  const nameFallback =
    sanitizeFallbackName(fallbackName, fallbackId) || 'Unknown device';

  return {
    device_id:
      getStringValue(
        getRecordValue(source, 'device_id'),
        getRecordValue(source, '_id'),
        getRecordValue(source, 'id')
      ) || fallbackId,
    device_name:
      getStringValue(
        getRecordValue(source, 'name'),
        getRecordValue(source, 'device_name')
      ) || nameFallback,
    network: getStringValue(getRecordValue(source, 'network')),
    category: getStringValue(getRecordValue(source, 'category')),
    status: getStringValue(getRecordValue(source, 'status')),
    is_active:
      typeof getRecordValue(source, 'isActive') === 'boolean'
        ? getRecordValue(source, 'isActive')
        : null,
    is_online:
      typeof getRecordValue(source, 'isOnline') === 'boolean'
        ? getRecordValue(source, 'isOnline')
        : null,
    last_active: getStringValue(getRecordValue(source, 'lastActive')),
    last_raw_data: getStringValue(getRecordValue(source, 'lastRawData')),
    description: getStringValue(getRecordValue(source, 'description')),
    site_id: getStringValue(
      nestedSite?._id,
      nestedSite?.site_id,
      nestedSiteDetails?._id,
      nestedSiteDetails?.site_id,
      getRecordValue(source, 'site_id')
    ),
    site_name: getStringValue(
      nestedSite?.name,
      nestedSite?.search_name,
      nestedSite?.formatted_name,
      nestedSite?.location_name,
      nestedSiteDetails?.name,
      nestedSiteDetails?.search_name,
      nestedSiteDetails?.formatted_name,
      nestedSiteDetails?.location_name
    ),
    site_search_name: getStringValue(
      nestedSite?.search_name,
      nestedSite?.formatted_name,
      nestedSite?.location_name,
      nestedSite?.name,
      nestedSiteDetails?.search_name,
      nestedSiteDetails?.formatted_name,
      nestedSiteDetails?.location_name,
      nestedSiteDetails?.name
    ),
    site_formatted_name: getStringValue(
      nestedSite?.formatted_name,
      nestedSite?.search_name,
      nestedSite?.location_name,
      nestedSite?.name,
      nestedSiteDetails?.formatted_name,
      nestedSiteDetails?.search_name,
      nestedSiteDetails?.location_name,
      nestedSiteDetails?.name
    ),
    site_location_name: getStringValue(
      nestedSite?.location_name,
      nestedSite?.search_name,
      nestedSite?.formatted_name,
      nestedSite?.name,
      nestedSiteDetails?.location_name,
      nestedSiteDetails?.search_name,
      nestedSiteDetails?.formatted_name,
      nestedSiteDetails?.name
    ),
    site_country: getStringValue(
      nestedSite?.country,
      nestedSiteDetails?.country
    ),
    site_city: getStringValue(nestedSite?.city, nestedSiteDetails?.city),
    site_region: getStringValue(nestedSite?.region, nestedSiteDetails?.region),
    site_county: getStringValue(nestedSite?.county, nestedSiteDetails?.county),
    site_sub_county: getStringValue(
      nestedSite?.sub_county,
      nestedSiteDetails?.sub_county
    ),
    site_parish: getStringValue(nestedSite?.parish, nestedSiteDetails?.parish),
    site_data_provider: getStringValue(
      nestedSite?.data_provider,
      nestedSiteDetails?.data_provider
    ),
    latitude: getNumberValue(
      getRecordValue(source, 'latitude'),
      getRecordValue(source, 'approximate_latitude'),
      nestedSite?.latitude,
      nestedSite?.approximate_latitude,
      nestedSiteDetails?.latitude,
      nestedSiteDetails?.approximate_latitude
    ),
    longitude: getNumberValue(
      getRecordValue(source, 'longitude'),
      getRecordValue(source, 'approximate_longitude'),
      nestedSite?.longitude,
      nestedSite?.approximate_longitude,
      nestedSiteDetails?.longitude,
      nestedSiteDetails?.approximate_longitude
    ),
  };
};

export const buildGridMetadataRows = (
  gridId: string,
  grid: Record<string, unknown> | undefined,
  selectedGridSites: Record<string, string[]>,
  selectedGridSiteIds: Record<string, string[]>,
  gridType: 'country' | 'city',
  siteIdFilter?: Set<string>
) => {
  const selectedSiteIds = getSelectedGridSiteIds(
    gridId,
    selectedGridSites,
    selectedGridSiteIds
  );

  // When a filter is provided, only build rows for the filtered IDs (trim +
  // lowercase normalized) so partial-data merges target exactly the missing
  // locations without re-emitting rows the API already returned.
  const normalizedFilter =
    siteIdFilter &&
    new Set(Array.from(siteIdFilter).map(id => normalizeLookupKey(String(id))));

  const filteredSiteIds = normalizedFilter
    ? selectedSiteIds.filter(siteId =>
        normalizedFilter.has(normalizeLookupKey(siteId))
      )
    : selectedSiteIds;

  if (filteredSiteIds.length === 0) {
    return [];
  }

  // Grid display name must come ONLY from human-facing fields, be sanitized
  // against raw IDs / 24-hex ObjectIds, and fall back to a neutral
  // placeholder — never `gridId` or `grid._id`.
  const gridName =
    sanitizeFallbackName(
      getStringValue(
        getRecordValue(grid, 'name'),
        getRecordValue(grid, 'long_name'),
        getRecordValue(grid, 'formatted_name'),
        getRecordValue(grid, 'search_name')
      ) ?? undefined,
      gridId
    ) || 'Unknown location';
  const locationKey = gridType === 'country' ? 'country_name' : 'city_name';

  const sites = Array.isArray(getRecordValue(grid, 'sites'))
    ? (getRecordValue(grid, 'sites') as Record<string, unknown>[])
    : [];

  if (sites.length === 0) {
    return filteredSiteIds.map(siteId =>
      buildSiteMetadataRow(undefined, siteId, {
        grid_id: gridId,
        grid_name: gridName,
        grid_type: gridType,
        [locationKey]: gridName,
      })
    );
  }

  const siteMap = new Map(
    sites
      .map(site => {
        const siteId =
          getStringValue(
            getRecordValue(site, '_id'),
            getRecordValue(site, 'site_id'),
            getRecordValue(site, 'id')
          ) || null;
        return siteId ? [siteId, site] : null;
      })
      .filter(
        (entry): entry is [string, Record<string, unknown>] => entry !== null
      )
  );

  return filteredSiteIds.map(siteId => {
    const site = siteMap.get(siteId);
    if (site) {
      return buildSiteMetadataRow(site, siteId, {
        grid_id: gridId,
        grid_name: gridName,
        grid_type: gridType,
        [locationKey]: gridName,
      });
    }

    return buildSiteMetadataRow(undefined, siteId, {
      grid_id: gridId,
      grid_name: gridName,
      grid_type: gridType,
      [locationKey]: gridName,
    });
  });
};

const buildMetadataFallbackRecords = (
  activeTab: TabType,
  selectedSiteIds: string[],
  selectedDeviceIds: string[],
  selectedGridIds: string[],
  selectedGridSites: Record<string, string[]>,
  selectedGridSiteIds: Record<string, string[]>,
  sitesData: TableItem[],
  devicesData: TableItem[],
  countriesData: TableItem[],
  citiesData: TableItem[],
  selectedSiteNames?: string[],
  selectedDeviceNames?: string[]
): MetadataRow[] => {
  if (activeTab === 'sites') {
    return selectedSiteIds.map(siteId => {
      const site = sitesData.find(item => String(item.id) === siteId);
      const fallbackName = selectedSiteNames?.[selectedSiteIds.indexOf(siteId)];
      return buildSiteMetadataRow(site, siteId, {}, fallbackName);
    });
  }

  if (activeTab === 'devices') {
    return selectedDeviceIds.map(deviceId => {
      const device = devicesData.find(item => String(item.id) === deviceId);
      const fallbackName =
        selectedDeviceNames?.[selectedDeviceIds.indexOf(deviceId)];
      return buildDeviceMetadataRow(device, deviceId, fallbackName);
    });
  }

  const gridData = activeTab === 'countries' ? countriesData : citiesData;
  const gridType = activeTab === 'countries' ? 'country' : 'city';

  return selectedGridIds.flatMap(gridId => {
    const grid = gridData.find(item => String(item.id) === gridId);
    return buildGridMetadataRows(
      gridId,
      grid as Record<string, unknown> | undefined,
      selectedGridSites,
      selectedGridSiteIds,
      gridType
    );
  });
};

/**
 * Builds metadata-only rows for the missing locations and merges them into
 * the download response so every selected location appears in the export.
 * Locations that already have readings keep their rows; missing ones get a
 * metadata-only row whose name falls back to the selected UI label, then a
 * neutral placeholder — never a raw ID.
 */
const mergeMissingLocationRecords = (
  response: DataDownloadResponse | string,
  activeTab: TabType,
  missingIds: string[],
  missingNames: string[],
  selectedGridIds: string[],
  selectedGridSites: Record<string, string[]>,
  selectedGridSiteIds: Record<string, string[]>,
  sitesData: TableItem[],
  devicesData: TableItem[],
  countriesData: TableItem[],
  citiesData: TableItem[]
): DataDownloadResponse => {
  // Parse existing records first so we can detect locations already present in
  // the response. A metadata row must NOT be appended for a location that
  // already has rows (e.g. rows lacking a numeric pollutant value) — that would
  // duplicate the location in the export.
  const existingRecords = parseDownloadResponseRecords(response);

  // Collect the location identifiers and names already present in the response.
  // Matching is case- and whitespace-insensitive. A metadata row is skipped
  // when its ID matches an existing record's ID. Names are consulted ONLY as a
  // legacy fallback for responses that carry no ID values at all, so a distinct
  // location that merely shares a display name with an existing one is never
  // dropped from the export.
  const existingIds = new Set<string>();
  const existingNames = new Set<string>();
  const idKeys = ['site_id', 'device_id', '_id', 'id'];
  const nameKeys = [
    'site_name',
    'device_name',
    'location_name',
    'search_name',
    'formatted_name',
    'country_name',
    'city_name',
  ];
  existingRecords.forEach(record => {
    idKeys.forEach(key => {
      const value = getStringValue(getRecordValue(record, key));
      if (value) existingIds.add(normalizeLookupKey(value));
    });
    nameKeys.forEach(key => {
      const value = getStringValue(getRecordValue(record, key));
      if (value) existingNames.add(normalizeLookupKey(value));
    });
  });

  const locationAlreadyPresent = (id: string, name?: string): boolean => {
    if (existingIds.has(normalizeLookupKey(id))) return true;
    // Legacy fallback only: when the response exposes no ID values at all, fall
    // back to a normalized name match so genuinely duplicate rows are still
    // skipped. Once any ID exists, name matching must not suppress a row —
    // display names are not unique across locations.
    if (
      existingIds.size === 0 &&
      name &&
      existingNames.has(normalizeLookupKey(name))
    ) {
      return true;
    }
    return false;
  };

  let metadataRows: MetadataRow[] = [];

  if (activeTab === 'sites') {
    metadataRows = missingIds.flatMap((siteId, index) => {
      if (locationAlreadyPresent(siteId, missingNames[index])) return [];
      const site = sitesData.find(item => String(item.id) === siteId);
      return [buildSiteMetadataRow(site, siteId, {}, missingNames[index])];
    });
  } else if (activeTab === 'devices') {
    metadataRows = missingIds.flatMap((deviceId, index) => {
      if (locationAlreadyPresent(deviceId, missingNames[index])) return [];
      const device = devicesData.find(item => String(item.id) === deviceId);
      return [buildDeviceMetadataRow(device, deviceId, missingNames[index])];
    });
  } else {
    const gridType = activeTab === 'countries' ? 'country' : 'city';
    const gridData = activeTab === 'countries' ? countriesData : citiesData;
    const missingIdSet = new Set(missingIds.map(id => normalizeLookupKey(id)));
    metadataRows = selectedGridIds.flatMap(gridId => {
      const grid = gridData.find(item => String(item.id) === gridId);
      return buildGridMetadataRows(
        gridId,
        grid as Record<string, unknown> | undefined,
        selectedGridSites,
        selectedGridSiteIds,
        gridType,
        missingIdSet
      );
    });
  }

  const mergedRecords: DownloadRecord[] = [...existingRecords, ...metadataRows];

  return {
    status: typeof response === 'string' ? 'success' : response.status,
    message:
      typeof response === 'string' ? 'Data export prepared' : response.message,
    data: mergedRecords as unknown as DataDownloadResponse['data'],
    metadata: {
      total_count: mergedRecords.length,
      has_more: false,
      next: null,
    },
  };
};

type DownloadRecord = Record<string, unknown>;

interface GridLocationLookupEntry {
  siteId: string;
  siteName: string;
  locationName: string;
}

const getNormalizedString = (...values: unknown[]) =>
  getStringValue(...values) || '';

/**
 * Normalizes a lookup key for the grid location maps: trim + lowercase.
 * Used on BOTH the build side (map keys) and the lookup side so that
 * site_id / site_name matches are case- and whitespace-insensitive
 * without changing the behavior of already-normalized values.
 */
const normalizeLookupKey = (value: string): string =>
  value.trim().toLowerCase();

export const buildGridLocationLookup = (
  gridData: TableItem[],
  selectedGridIds: string[],
  selectedGridSites: Record<string, string[]>,
  selectedGridSiteIds: Record<string, string[]>
) => {
  const bySiteId = new Map<string, GridLocationLookupEntry>();
  const bySiteName = new Map<string, GridLocationLookupEntry>();

  selectedGridIds.forEach(gridId => {
    const grid = gridData.find(item => String(item.id) === gridId);
    // Human-facing fields only, sanitized — never `grid._id` / `gridId`.
    const gridName =
      sanitizeFallbackName(
        getNormalizedString(
          getRecordValue(grid, 'name'),
          getRecordValue(grid, 'long_name'),
          getRecordValue(grid, 'formatted_name'),
          getRecordValue(grid, 'search_name')
        ),
        gridId
      ) || 'Unknown location';

    const selectedSiteIds = getSelectedGridSiteIds(
      gridId,
      selectedGridSites,
      selectedGridSiteIds
    );

    if (selectedSiteIds.length === 0) {
      return;
    }

    const gridSites = getRecordValue(grid, 'sites');
    const sites = Array.isArray(gridSites)
      ? (gridSites as Record<string, unknown>[])
      : [];
    const siteMap = new Map<string, Record<string, unknown>>();

    sites.forEach(site => {
      const siteId = getNormalizedString(
        getRecordValue(site, '_id'),
        getRecordValue(site, 'site_id'),
        getRecordValue(site, 'id')
      );

      if (siteId) {
        siteMap.set(siteId, site);
      }
    });

    selectedSiteIds.forEach(siteId => {
      const site = siteMap.get(siteId);
      // Sanitized human name; falls back to a neutral placeholder so a raw
      // site ID / ObjectId never lands in `site_name`.
      const sanitizedSiteName = sanitizeFallbackName(
        getNormalizedString(
          getRecordValue(site, 'name'),
          getRecordValue(site, 'search_name'),
          getRecordValue(site, 'formatted_name'),
          getRecordValue(site, 'location_name')
        ),
        siteId
      );
      const siteName = sanitizedSiteName || 'Unknown location';

      const entry = {
        siteId,
        siteName,
        locationName: gridName,
      };

      bySiteId.set(normalizeLookupKey(siteId), entry);
      // Register by name ONLY when a real name exists — the shared placeholder
      // must never collide across distinct sites.
      if (sanitizedSiteName) {
        bySiteName.set(normalizeLookupKey(sanitizedSiteName), entry);
      }
    });
  });

  return { bySiteId, bySiteName };
};

const normalizeCountryCityDownloadResponse = (
  response: DataDownloadResponse | string,
  activeTab: TabType,
  gridData: TableItem[],
  selectedGridIds: string[],
  selectedGridSites: Record<string, string[]>,
  selectedGridSiteIds: Record<string, string[]>
): DataDownloadResponse => {
  const gridLocationKey =
    activeTab === 'countries' ? 'country_name' : 'city_name';
  const gridLocationLookup = buildGridLocationLookup(
    gridData,
    selectedGridIds,
    selectedGridSites,
    selectedGridSiteIds
  );

  const records: DownloadRecord[] = parseDownloadResponseRecords(response);

  const enhancedRecords = records.map(record => {
    const recordSiteId = getNormalizedString(
      record.site_id,
      record.siteId,
      record._id,
      record.id
    );
    const recordSiteName = getNormalizedString(
      record.site_name,
      record.siteName,
      record.name,
      record.search_name,
      record.formatted_name,
      record.location_name
    );

    const matchedLookup =
      (recordSiteId
        ? gridLocationLookup.bySiteId.get(normalizeLookupKey(recordSiteId))
        : undefined) ||
      (recordSiteName
        ? gridLocationLookup.bySiteName.get(normalizeLookupKey(recordSiteName))
        : undefined);

    const resolvedSiteId = recordSiteId || matchedLookup?.siteId || '';
    const resolvedLocationName = getNormalizedString(
      record[gridLocationKey],
      record.country_name,
      record.city_name,
      record.country,
      record.city,
      matchedLookup?.locationName
    );
    const resolvedDeviceName = getNormalizedString(
      record.device_name,
      record.deviceName,
      record.device
    );

    return {
      ...record,
      site_id: resolvedSiteId,
      // site_name falls back to the matched lookup name (re-sanitized in case
      // a stale/legacy entry carried an ID), then a neutral placeholder —
      // never the raw resolved ID.
      site_name:
        recordSiteName ||
        sanitizeFallbackName(matchedLookup?.siteName, resolvedSiteId) ||
        'Unknown location',
      [gridLocationKey]: resolvedLocationName || '',
      ...(resolvedDeviceName ? { device_name: resolvedDeviceName } : {}),
    };
  });

  return {
    status: typeof response === 'string' ? 'success' : response.status,
    message:
      typeof response === 'string' ? 'Data export prepared' : response.message,
    data: enhancedRecords as unknown as DataDownloadResponse['data'],
    metadata:
      typeof response === 'string'
        ? {
            total_count: enhancedRecords.length,
            has_more: false,
            next: null,
          }
        : response.metadata,
  };
};

const getApiErrorMessage = (error: unknown): string | undefined => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const responseData = axiosError?.response?.data;

  if (!responseData) {
    return undefined;
  }

  if (typeof responseData === 'string') {
    return responseData;
  }

  if (typeof responseData === 'object' && responseData !== null) {
    const message = (responseData as ApiErrorResponse).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return undefined;
};

const isNoDataDownloadError = (error: unknown): boolean => {
  // The API signals "no data" in the response body message, but plain Error
  // instances (or non-Axios failures) carry it on `message` instead.
  const message = getApiErrorMessage(error) ?? (error as Error)?.message;
  return Boolean(message && /\bno data\b/i.test(message));
};

/**
 * Decides whether a failed download may degrade to a metadata-only export.
 *
 * Server errors surface to the user: a 5xx is never retried and never
 * fallback-ed into a metadata CSV — that would mask the outage behind a
 * "No measurement data found" toast. Only an explicit "no data" response or
 * a 404 (nothing to export for that period/location) falls back.
 */
export const shouldUseMetadataFallback = (error: unknown): boolean => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const status = axiosError?.response?.status;

  // 5xx — server failure, not an empty result set.
  if (status !== undefined && status >= 500 && status < 600) {
    return false;
  }

  if (isNoDataDownloadError(error)) {
    return true;
  }

  if (status === 401 || status === 403 || axiosError?.code === 'ERR_CANCELED') {
    return false;
  }

  return status === 404;
};

const hasDownloadRecords = (
  response: DataDownloadResponse | string,
  selectedPollutants: string[]
) => {
  return getMeasurementRecords(response, selectedPollutants).length > 0;
};

export { getGridSiteNames };

const getGridSiteNames = (
  activeTab: TabType,
  selectedGridIds: string[],
  selectedGridSiteIds: Record<string, string[]>,
  selectedGridSites: Record<string, string[]>,
  gridData: TableItem[]
): string[] => {
  if (activeTab !== 'countries' && activeTab !== 'cities') return [];

  const siteIdToName = new Map<string, string>();

  // Build lookup from grid data — handles both populated and empty sites arrays
  gridData.forEach(grid => {
    const sites = grid.sites as
      | Array<{
          _id: string;
          name: string;
          search_name?: string;
          formatted_name?: string;
          location_name?: string;
        }>
      | undefined;
    if (sites && sites.length > 0) {
      sites.forEach(site => {
        if (site._id) {
          const name =
            site.name ||
            site.search_name ||
            site.formatted_name ||
            site.location_name ||
            site._id;
          siteIdToName.set(site._id, name);
        }
      });
    }
  });

  // Use resolveGridSitesForDownload for the authoritative deduped/trimmed id
  // list so labels stay exactly 1:1 with the ids used for the request.
  // A missing name falls back to a neutral label — never the raw ID.
  return resolveGridSitesForDownload(
    selectedGridIds,
    selectedGridSites,
    selectedGridSiteIds
  ).map(siteId => siteIdToName.get(siteId) ?? 'Unknown location');
};

const getCalendarDayDifference = (from: Date, to: Date) => {
  const startUtc = Date.UTC(
    from.getFullYear(),
    from.getMonth(),
    from.getDate()
  );
  const endUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());

  return Math.max(0, (endUtc - startUtc) / (1000 * 60 * 60 * 24));
};

const getTimePeriodType = (durationDays: number): 'real_time' | 'historical' =>
  durationDays <= 1 ? 'real_time' : 'historical';

const buildDownloadSummaryItems = (
  activeTab: TabType,
  dataType: string,
  frequency: string,
  dateRange: DateRange,
  selectedPollutants: string[],
  locationCount: number,
  selectedColumnKeys: string[] | undefined,
  fallbackApplied: boolean
) => [
  {
    label: 'Source',
    value: fallbackApplied ? 'Metadata fallback' : 'API data',
  },
  { label: 'Tab', value: activeTab },
  { label: 'Data type', value: dataType },
  { label: 'Frequency', value: frequency },
  {
    label: 'Date range',
    value: `${dateRange.from?.toLocaleDateString() || '—'} - ${dateRange.to?.toLocaleDateString() || '—'}`,
  },
  { label: 'Locations', value: String(locationCount) },
  { label: 'Pollutants', value: String(selectedPollutants.length) },
  {
    label: 'Columns',
    value: selectedColumnKeys ? String(selectedColumnKeys.length) : 'Available',
  },
];

const buildFilenameBase = (
  fileTitle: string,
  request: DataDownloadRequest,
  activeTab: TabType
) => {
  const defaultFilename = `air-quality-data-${request.startDateTime.split('T')[0]}-to-${request.endDateTime.split('T')[0]}`;
  const base = (fileTitle || defaultFilename).replace(
    /\.(csv|json|pdf|xlsx)$/i,
    ''
  );
  // Append the active tab so sites/devices/countries/cities exports never
  // collide on the same `…-metadata.csv` filename. A user-supplied title that
  // already contains the tab (as a standalone segment) is left unchanged so the
  // tab is never appended twice.
  const hasTabSegment = base
    .split(/[^a-z0-9]+/i)
    .some(segment => segment.toLowerCase() === activeTab.toLowerCase());

  return hasTabSegment ? base : `${base}-${activeTab}`;
};

const getDownloadColumnKeysForRequest = (
  activeTab: TabType,
  selectedColumnKeys?: string[]
): string[] | undefined => {
  if (selectedColumnKeys === undefined) {
    return undefined;
  }

  const normalizedSelectedColumnKeys = Array.from(
    new Set(selectedColumnKeys.filter(Boolean))
  );

  if (activeTab !== 'countries' && activeTab !== 'cities') {
    return normalizedSelectedColumnKeys;
  }

  // Grid exports key the location off the country/city name, not site_id or
  // device_name — those identifiers must not be added to the request.
  const requiredLocationKeys =
    activeTab === 'countries'
      ? ['site_name', 'country_name']
      : ['site_name', 'city_name'];

  return Array.from(
    new Set([...normalizedSelectedColumnKeys, ...requiredLocationKeys])
  );
};

/**
 * Custom hook for data export actions and event handlers
 */
export const useDataExportActions = (
  dateRange: DateRange | undefined,
  activeTab: TabType,
  selectedSites: string[],
  selectedDevices: string[],
  selectedSiteIds: string[],
  selectedDeviceIds: string[],
  selectedGridIds: string[],
  selectedGridSites: Record<string, string[]>,
  selectedGridSiteIds: Record<string, string[]>,
  selectedPollutants: string[],
  dataType: string,
  fileType: string,
  frequency: string,
  deviceCategory: DeviceCategory,
  fileTitle: string,
  sitesData: TableItem[],
  devicesData: TableItem[],
  countriesData: TableItem[],
  citiesData: TableItem[]
) => {
  const dispatch = useDispatch();
  const posthog = usePostHog();
  const { trigger: fetchDownloadData, isMutating: isDownloading } =
    useDownloadData();
  const downloadAbortRef = useRef<AbortController | null>(null);

  interface HandleDownloadOptions {
    customSelectedGridSiteIds?: Record<string, string[]>;
    exportColumnKeys?: string[];
  }

  // Handle data download
  const handleDownload = useCallback(
    async ({
      customSelectedGridSiteIds,
      exportColumnKeys,
    }: HandleDownloadOptions = {}): Promise<PreparedDownloadResult | null> => {
      if (!dateRange?.from || !dateRange?.to) {
        toast.error(
          'Date Range Required',
          'Please select a date range for data export.'
        );
        return null;
      }

      if (activeTab === 'sites' && selectedSiteIds.length === 0) {
        toast.error(
          'Site Selection Required',
          'Please select at least one site for data export.'
        );
        return null;
      }

      if (activeTab === 'devices' && selectedDeviceIds.length === 0) {
        toast.error(
          'Device Selection Required',
          'Please select at least one device for data export.'
        );
        return null;
      }

      if (exportColumnKeys && exportColumnKeys.length === 0) {
        toast.error(
          'Download Columns Required',
          'Please select at least one column to include in the exported file.'
        );
        return null;
      }

      const effectiveSelectedGridSiteIds =
        customSelectedGridSiteIds ?? selectedGridSiteIds;

      const sitesForDownload =
        activeTab === 'countries' || activeTab === 'cities'
          ? resolveGridSitesForDownload(
              selectedGridIds,
              selectedGridSites,
              effectiveSelectedGridSiteIds
            )
          : [];

      if (
        (activeTab === 'countries' || activeTab === 'cities') &&
        sitesForDownload.length === 0
      ) {
        toast.error(
          `${activeTab === 'countries' ? 'Country' : 'City'} Selection Required`,
          `Please select at least one monitoring site under the selected ${activeTab === 'countries' ? 'country' : 'city'}.`
        );
        return null;
      }

      if (selectedPollutants.length === 0) {
        toast.error(
          'Pollutant Selection Required',
          'Please select at least one pollutant for data export.'
        );
        return null;
      }

      const effectiveDataType: DataDownloadRequest['datatype'] =
        activeTab === 'devices' && deviceCategory === 'bam'
          ? 'raw'
          : frequency === 'raw'
            ? 'raw'
            : (dataType as DataDownloadRequest['datatype']);

      const durationDays = getCalendarDayDifference(
        dateRange.from,
        dateRange.to
      );

      const timePeriodType = getTimePeriodType(durationDays);

      if (durationDays > LARGE_DATE_RANGE_THRESHOLD) {
        toast.error(
          'Date Range Too Large',
          `Please split this export into batches of ${LARGE_DATE_RANGE_THRESHOLD} days or fewer to avoid backend timeouts.`
        );
        return null;
      }

      const request = buildDataDownloadRequest({
        dateRange,
        activeTab,
        selectedSites,
        selectedSiteIds,
        selectedDeviceIds,
        selectedDeviceNames: selectedDevices,
        selectedGridIds,
        selectedGridSites,
        selectedGridSiteIds: effectiveSelectedGridSiteIds,
        customSelectedGridSiteIds,
        selectedPollutants,
        dataType,
        fileType,
        frequency,
        deviceCategory,
      });

      if (downloadAbortRef.current) {
        downloadAbortRef.current.abort();
      }
      const abortController = new AbortController();
      downloadAbortRef.current = abortController;

      trackFeatureUsage(posthog, 'data_export', 'download_started', {
        active_tab: activeTab,
        data_type: effectiveDataType,
        file_type: fileType,
        frequency,
        pollutant_count: selectedPollutants.length,
        location_count:
          activeTab === 'sites'
            ? selectedSiteIds.length
            : activeTab === 'devices'
              ? selectedDeviceIds.length
              : selectedGridIds.length,
        duration_days: durationDays,
        time_period_type: timePeriodType,
        dataset_label:
          activeTab === 'devices'
            ? `${deviceCategory} devices`
            : `${activeTab} export`,
      });

      trackEvent('data_download_started', {
        active_tab: activeTab,
        data_type: effectiveDataType,
        file_type: fileType,
        frequency,
        pollutant_count: selectedPollutants.length,
        duration_days: durationDays,
        time_period_type: timePeriodType,
      });

      const downloadColumnKeys = getDownloadColumnKeysForRequest(
        activeTab,
        exportColumnKeys
      );

      const prepareMetadataFallback = (): PreparedDownloadResult => {
        const fallbackRecords = buildMetadataFallbackRecords(
          activeTab,
          selectedSiteIds,
          selectedDeviceIds,
          selectedGridIds,
          selectedGridSites,
          effectiveSelectedGridSiteIds,
          sitesData,
          devicesData,
          countriesData,
          citiesData
        );

        const fallbackResponse = {
          status: 'success',
          message: 'Metadata export generated for the selected items.',
          data: fallbackRecords,
        } as unknown as DataDownloadResponse;
        const normalizedFallbackResponse =
          activeTab === 'countries' || activeTab === 'cities'
            ? normalizeCountryCityDownloadResponse(
                fallbackResponse,
                activeTab,
                activeTab === 'countries' ? countriesData : citiesData,
                selectedGridIds,
                selectedGridSites,
                effectiveSelectedGridSiteIds
              )
            : fallbackResponse;

        const effectiveLocationCountFallback =
          activeTab === 'sites'
            ? selectedSites.length
            : activeTab === 'devices'
              ? selectedDeviceIds.length
              : sitesForDownload.length;

        return {
          request,
          response: normalizedFallbackResponse,
          selectedColumnKeys: undefined,
          filenameBase: `${buildFilenameBase(fileTitle, request, activeTab)}-metadata`,
          fallbackApplied: true,
          activeTab,
          locationCount: effectiveLocationCountFallback,
          summaryItems: buildDownloadSummaryItems(
            activeTab,
            effectiveDataType,
            frequency,
            dateRange,
            selectedPollutants,
            effectiveLocationCountFallback,
            undefined,
            true
          ),
        };
      };

      try {
        const rawResponse = await fetchDownloadData({
          request,
          signal: abortController.signal,
        });

        if (abortController.signal.aborted) return null;

        const normalizedResponse =
          activeTab === 'countries' || activeTab === 'cities'
            ? normalizeCountryCityDownloadResponse(
                rawResponse,
                activeTab,
                activeTab === 'countries' ? countriesData : citiesData,
                selectedGridIds,
                selectedGridSites,
                effectiveSelectedGridSiteIds
              )
            : rawResponse;

        if (!hasDownloadRecords(normalizedResponse, selectedPollutants)) {
          toast.warning(
            'No measurement data found',
            'No readings are available for the selected time period and filters. Only location metadata has been included in this export.'
          );
          return prepareMetadataFallback();
        }

        const partialDataSelectedIds =
          activeTab === 'sites'
            ? selectedSiteIds
            : activeTab === 'devices'
              ? selectedDeviceIds
              : sitesForDownload;
        const partialDataSelectedLabels =
          activeTab === 'sites'
            ? selectedSites
            : activeTab === 'devices'
              ? selectedDevices
              : getGridSiteNames(
                  activeTab,
                  selectedGridIds,
                  effectiveSelectedGridSiteIds,
                  selectedGridSites,
                  activeTab === 'countries' ? countriesData : citiesData
                );

        const partialDataWarning = getPartialDataWarning(
          normalizedResponse,
          activeTab,
          partialDataSelectedIds,
          partialDataSelectedLabels,
          selectedPollutants
        );

        const effectiveLocationCount =
          activeTab === 'sites'
            ? selectedSites.length
            : activeTab === 'devices'
              ? selectedDeviceIds.length
              : sitesForDownload.length;

        // When some locations have no readings, merge metadata-only rows for
        // exactly those missing IDs so the export includes every selected
        // location. The merged response preserves status/message and updates
        // the pagination metadata to reflect the full row count.
        const responseWithMissingRecords = partialDataWarning
          ? mergeMissingLocationRecords(
              normalizedResponse,
              activeTab,
              partialDataWarning.missingIds,
              partialDataWarning.missingNames,
              selectedGridIds,
              selectedGridSites,
              effectiveSelectedGridSiteIds,
              sitesData,
              devicesData,
              countriesData,
              citiesData
            )
          : normalizedResponse;

        if (partialDataWarning) {
          const missingCount = partialDataWarning.missingNames.length;
          const totalCount = partialDataWarning.totalSelected;
          const missingList = partialDataWarning.missingNames.join(', ');
          toast.warning(
            'Partial data available',
            `${missingCount} of ${totalCount} locations returned no readings: ${missingList}. The download will include metadata only for those.`
          );
        } else {
          toast.success(
            'Download ready',
            `Your export for ${effectiveLocationCount} location${effectiveLocationCount !== 1 ? 's' : ''} is ready.`
          );
        }

        return {
          request,
          response: responseWithMissingRecords,
          selectedColumnKeys: downloadColumnKeys,
          filenameBase: buildFilenameBase(fileTitle, request, activeTab),
          fallbackApplied: false,
          activeTab,
          locationCount: effectiveLocationCount,
          summaryItems: buildDownloadSummaryItems(
            activeTab,
            effectiveDataType,
            frequency,
            dateRange,
            selectedPollutants,
            effectiveLocationCount,
            downloadColumnKeys,
            false
          ),
        };
      } catch (error) {
        if (abortController.signal.aborted) return null;

        if (shouldUseMetadataFallback(error)) {
          toast.warning(
            'No measurement data found',
            'No readings are available for the selected time period and filters. Only location metadata has been included in this export.'
          );
          return prepareMetadataFallback();
        }

        console.error('Download failed:', error);

        trackFeatureUsage(posthog, 'data_export', 'download_failed', {
          active_tab: activeTab,
          data_type: effectiveDataType,
          file_type: fileType,
          duration_days: durationDays,
          time_period_type: timePeriodType,
        });

        trackEvent('data_download_failed', {
          active_tab: activeTab,
          data_type: effectiveDataType,
          file_type: fileType,
          duration_days: durationDays,
          time_period_type: timePeriodType,
        });

        const userFriendlyMessage = getUserFriendlyErrorMessage(error);

        toast.error('Download Failed', userFriendlyMessage);
        return null;
      }
    },
    [
      dateRange,
      activeTab,
      selectedSites,
      selectedDevices,
      selectedSiteIds,
      selectedDeviceIds,
      selectedGridIds,
      selectedGridSites,
      selectedGridSiteIds,
      selectedPollutants,
      dataType,
      fileType,
      frequency,
      deviceCategory,
      fileTitle,
      sitesData,
      devicesData,
      countriesData,
      citiesData,
      fetchDownloadData,
      posthog,
    ]
  );

  // Handle visualize data - open more insights dialog
  const handleVisualizeData = useCallback(() => {
    // Track to Google Analytics
    trackEvent('data_visualize_clicked', {
      active_tab: activeTab,
      sites_count: selectedSiteIds.length,
      devices_count: selectedDeviceIds.length,
      grids_count: selectedGridIds.length,
    });

    if (activeTab === 'sites' && selectedSiteIds.length > 0) {
      // For sites tab, use the selected site IDs directly
      const sitesToVisualize = createSitesForVisualization(
        selectedSiteIds,
        sitesData
      );
      dispatch(openMoreInsights({ sites: sitesToVisualize }));
    } else if (activeTab === 'devices' && selectedDeviceIds.length > 0) {
      // For devices tab, get the site data from the device.site field
      const sitesToVisualize = createSitesFromDevicesForVisualization(
        selectedDeviceIds,
        devicesData
      );
      dispatch(openMoreInsights({ sites: sitesToVisualize }));
    } else if (
      (activeTab === 'countries' || activeTab === 'cities') &&
      selectedGridIds.length > 0
    ) {
      // For countries/cities tab, extract sites from selected grids
      const gridData = activeTab === 'countries' ? countriesData : citiesData;
      const sitesToVisualize = createSitesFromGridsForVisualization(
        selectedGridIds,
        gridData
      );
      dispatch(openMoreInsights({ sites: sitesToVisualize }));
    }
  }, [
    activeTab,
    selectedSiteIds,
    selectedDeviceIds,
    selectedGridIds,
    sitesData,
    devicesData,
    countriesData,
    citiesData,
    dispatch,
  ]);

  const cancelDownload = useCallback(() => {
    downloadAbortRef.current?.abort();
    downloadAbortRef.current = null;
  }, []);

  // Cleanup abort controller on unmount
  React.useEffect(() => {
    return () => {
      cancelDownload();
    };
  }, [cancelDownload]);

  return {
    handleDownload,
    handleVisualizeData,
    isDownloading,
    cancelDownload,
  };
};
