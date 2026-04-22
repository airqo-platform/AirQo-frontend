import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { usePostHog } from 'posthog-js/react';
import { openMoreInsights } from '@/shared/store/insightsSlice';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { trackEvent } from '@/shared/utils/analytics';
import {
  trackDataDownload,
  trackFeatureUsage,
} from '@/shared/utils/enhancedAnalytics';
import { useDataDownload } from '@/modules/analytics/hooks';
import { DateRange } from '@/shared/components/calendar/types';
import { LARGE_DATE_RANGE_THRESHOLD } from '../constants/dataExportConstants';
import { TabType, DeviceCategory, TableItem } from '../types/dataExportTypes';
import {
  createSitesForVisualization,
  createSitesFromDevicesForVisualization,
  createSitesFromGridsForVisualization,
} from '../utils/dataExportUtils';
import { buildDataDownloadRequest } from '../utils/dataExportRequest';
import { buildDownloadFileContent } from '../utils/dataExportFile';
import type { DataDownloadResponse } from '@/shared/types/api';
import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  status?: string;
  message?: string;
  data?: unknown;
  metadata?: unknown;
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
  extras: Record<string, unknown> = {}
): MetadataRow => {
  const nestedSite = getNestedRecord(getRecordValue(source, 'site'));
  const nestedSiteDetails = getNestedRecord(
    getRecordValue(source, 'siteDetails')
  );

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
      ) || fallbackId,
    search_name:
      getStringValue(
        getRecordValue(source, 'search_name'),
        getRecordValue(source, 'formatted_name'),
        getRecordValue(source, 'location_name'),
        getRecordValue(source, 'name'),
        nestedSite?.search_name,
        nestedSiteDetails?.search_name
      ) || fallbackId,
    formatted_name:
      getStringValue(
        getRecordValue(source, 'formatted_name'),
        getRecordValue(source, 'search_name'),
        getRecordValue(source, 'location_name'),
        getRecordValue(source, 'name'),
        nestedSite?.formatted_name,
        nestedSiteDetails?.formatted_name
      ) || fallbackId,
    location_name:
      getStringValue(
        getRecordValue(source, 'location_name'),
        getRecordValue(source, 'search_name'),
        getRecordValue(source, 'formatted_name'),
        getRecordValue(source, 'name'),
        nestedSite?.location_name,
        nestedSiteDetails?.location_name
      ) || fallbackId,
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
  fallbackId: string
): MetadataRow => {
  const nestedSite = getNestedRecord(getRecordValue(source, 'site'));
  const nestedSiteDetails = getNestedRecord(
    getRecordValue(source, 'siteDetails')
  );

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
      ) || fallbackId,
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

const buildGridMetadataRows = (
  gridId: string,
  grid: Record<string, unknown> | undefined,
  selectedGridSites: Record<string, string[]>,
  selectedGridSiteIds: Record<string, string[]>,
  gridType: 'country' | 'city'
) => {
  const selectedSiteIds = getSelectedGridSiteIds(
    gridId,
    selectedGridSites,
    selectedGridSiteIds
  );

  if (selectedSiteIds.length === 0) {
    return [];
  }

  const gridName =
    getStringValue(
      getRecordValue(grid, 'name'),
      getRecordValue(grid, 'long_name'),
      getRecordValue(grid, '_id'),
      getRecordValue(grid, 'id')
    ) || gridId;

  const sites = Array.isArray(getRecordValue(grid, 'sites'))
    ? (getRecordValue(grid, 'sites') as Record<string, unknown>[])
    : [];

  if (sites.length === 0) {
    return selectedSiteIds.map(siteId =>
      buildSiteMetadataRow(undefined, siteId, {
        grid_id: gridId,
        grid_name: gridName,
        grid_type: gridType,
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

  return selectedSiteIds.map(siteId => {
    const site = siteMap.get(siteId);
    if (site) {
      return buildSiteMetadataRow(site, siteId, {
        grid_id: gridId,
        grid_name: gridName,
        grid_type: gridType,
      });
    }

    return buildSiteMetadataRow(undefined, siteId, {
      grid_id: gridId,
      grid_name: gridName,
      grid_type: gridType,
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
  citiesData: TableItem[]
): MetadataRow[] => {
  if (activeTab === 'sites') {
    return selectedSiteIds.map(siteId => {
      const site = sitesData.find(item => String(item.id) === siteId);
      return buildSiteMetadataRow(site, siteId);
    });
  }

  if (activeTab === 'devices') {
    return selectedDeviceIds.map(deviceId => {
      const device = devicesData.find(item => String(item.id) === deviceId);
      return buildDeviceMetadataRow(device, deviceId);
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
  const message = getApiErrorMessage(error)?.toLowerCase();
  return Boolean(message && message.includes('no data'));
};

const saveDownloadFile = (
  content: string,
  mimeType: string,
  filename: string
) => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

const getSelectedNamesFromTable = (
  ids: string[],
  table: TableItem[]
): string[] =>
  ids
    .map(id => table.find(item => String(item.id) === id)?.name || id)
    .filter((name): name is string => Boolean(name));

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
  const { downloadData, isDownloading } = useDataDownload();

  interface HandleDownloadOptions {
    customSelectedGridSiteIds?: Record<string, string[]>;
    exportColumnKeys?: string[];
  }

  // Handle data download
  const handleDownload = useCallback(
    async ({
      customSelectedGridSiteIds,
      exportColumnKeys,
    }: HandleDownloadOptions = {}): Promise<boolean> => {
      if (!dateRange?.from || !dateRange?.to) {
        toast.error(
          'Date Range Required',
          'Please select a date range for data export.'
        );
        return false;
      }

      if (activeTab === 'sites' && selectedSiteIds.length === 0) {
        toast.error(
          'Site Selection Required',
          'Please select at least one site for data export.'
        );
        return false;
      }

      if (activeTab === 'devices' && selectedDeviceIds.length === 0) {
        toast.error(
          'Device Selection Required',
          'Please select at least one device for data export.'
        );
        return false;
      }

      if (exportColumnKeys && exportColumnKeys.length === 0) {
        toast.error(
          'Download Columns Required',
          'Please select at least one column to include in the exported file.'
        );
        return false;
      }

      const effectiveSelectedGridSiteIds =
        customSelectedGridSiteIds || selectedGridSiteIds;

      if (
        (activeTab === 'countries' || activeTab === 'cities') &&
        Object.keys(effectiveSelectedGridSiteIds).length === 0 &&
        Object.keys(selectedGridSites).length === 0
      ) {
        toast.error(
          `${activeTab === 'countries' ? 'Country' : 'City'} Selection Required`,
          `Please select a ${activeTab === 'countries' ? 'country' : 'city'} for data export.`
        );
        return false;
      }

      if (selectedPollutants.length === 0) {
        toast.error(
          'Pollutant Selection Required',
          'Please select at least one pollutant for data export.'
        );
        return false;
      }

      const effectiveDataType: 'calibrated' | 'raw' =
        activeTab === 'devices' && deviceCategory === 'bam'
          ? 'raw'
          : (dataType as 'calibrated' | 'raw');

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
        return false;
      }

      const request = buildDataDownloadRequest({
        dateRange,
        activeTab,
        selectedSites,
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

      const locationNames =
        activeTab === 'sites'
          ? getSelectedNamesFromTable(selectedSiteIds, sitesData)
          : activeTab === 'devices'
            ? selectedDevices
            : getSelectedNamesFromTable(
                selectedGridIds,
                activeTab === 'countries' ? countriesData : citiesData
              );

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

      // Extract sites for countries/cities
      const sitesForDownload: string[] = [];
      if (activeTab === 'countries' || activeTab === 'cities') {
        const effectiveSelectedGridSiteIds =
          customSelectedGridSiteIds || selectedGridSiteIds;
        // For each selected grid, use custom selection if available, otherwise use default selection
        selectedGridIds.forEach(gridId => {
          const customSites = effectiveSelectedGridSiteIds[gridId];
          const defaultSites = selectedGridSites[gridId];
          const sites =
            customSites && customSites.length > 0
              ? customSites
              : defaultSites || [];
          sitesForDownload.push(...sites);
        });
      }

      try {
        await downloadData(request, fileTitle || undefined, {
          selectedColumnKeys: exportColumnKeys,
        });

        // Enhanced analytics tracking with comprehensive details
        // Use the same deviceCategory logic as the API request
        const effectiveDeviceCategory =
          activeTab === 'countries' || activeTab === 'cities'
            ? 'lowcost'
            : deviceCategory;

        // Calculate locationCount based on tab
        const effectiveLocationCount =
          activeTab === 'sites'
            ? selectedSites.length
            : activeTab === 'devices'
              ? undefined
              : sitesForDownload.length;

        trackDataDownload(posthog, {
          dataType: effectiveDataType,
          fileType: fileType as 'csv' | 'json',
          frequency: frequency as 'hourly' | 'daily' | 'monthly',
          pollutants: selectedPollutants,
          locationCount: effectiveLocationCount,
          deviceCount:
            activeTab === 'devices' ? selectedDeviceIds.length : undefined,
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
          durationDays,
          deviceCategory: effectiveDeviceCategory as 'lowcost' | 'reference',
          source: activeTab,
          datasetLabel:
            activeTab === 'devices'
              ? `${deviceCategory} devices`
              : `${activeTab} export`,
          locationNames,
          timePeriodType,
          selectedGridIds:
            activeTab === 'countries' || activeTab === 'cities'
              ? selectedGridIds
              : undefined,
          selectedSiteIds: activeTab === 'sites' ? selectedSiteIds : undefined,
        });

        toast.success(
          'Download Started',
          'Your data export has been initiated successfully.'
        );
        return true;
      } catch (error) {
        if (isNoDataDownloadError(error)) {
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
            message:
              'No readings were returned. Exporting metadata for the selected items instead.',
            data: fallbackRecords,
          } as unknown as DataDownloadResponse;

          const { content, mimeType, extension } = buildDownloadFileContent(
            fallbackResponse,
            request.downloadType
          );

          const defaultFilename = `air-quality-data-${request.startDateTime.split('T')[0]}-to-${request.endDateTime.split('T')[0]}`;
          const metadataBaseName = `${(fileTitle || defaultFilename).replace(/\.(csv|json)$/i, '')}-metadata`;
          const filename = metadataBaseName.endsWith(`.${extension}`)
            ? metadataBaseName
            : `${metadataBaseName}.${extension}`;

          saveDownloadFile(content, mimeType, filename);

          const effectiveDeviceCategoryFallback =
            activeTab === 'countries' || activeTab === 'cities'
              ? 'lowcost'
              : deviceCategory;

          const effectiveLocationCountFallback =
            activeTab === 'sites'
              ? selectedSites.length
              : activeTab === 'devices'
                ? undefined
                : sitesForDownload.length;

          trackDataDownload(posthog, {
            dataType: effectiveDataType,
            fileType: fileType as 'csv' | 'json',
            frequency: frequency as 'hourly' | 'daily' | 'monthly',
            pollutants: selectedPollutants,
            locationCount: effectiveLocationCountFallback,
            deviceCount:
              activeTab === 'devices' ? selectedDeviceIds.length : undefined,
            startDate: dateRange.from.toISOString(),
            endDate: dateRange.to.toISOString(),
            durationDays,
            deviceCategory: effectiveDeviceCategoryFallback as
              | 'lowcost'
              | 'reference',
            source: activeTab,
            datasetLabel:
              activeTab === 'devices'
                ? `${deviceCategory} devices metadata`
                : `${activeTab} metadata export`,
            locationNames,
            timePeriodType,
            selectedGridIds:
              activeTab === 'countries' || activeTab === 'cities'
                ? selectedGridIds
                : undefined,
            selectedSiteIds:
              activeTab === 'sites' ? selectedSiteIds : undefined,
          });

          toast.success(
            'Metadata Download Started',
            'No readings were returned, so we downloaded metadata for the selected items instead.'
          );
          return true;
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

        // Check for "No data found" error specifically
        let userFriendlyMessage = getUserFriendlyErrorMessage(error);

        // If it's an Axios error with "No data found" message, provide custom message
        const axiosError = error as AxiosError;
        if (
          axiosError?.response?.data &&
          (axiosError.response.data as ApiErrorResponse).message ===
            'No data found'
        ) {
          userFriendlyMessage =
            'No data is available for the selected criteria. Please try adjusting your date range, site/device selections, or pollutant choices.';
        }

        toast.error('Download Failed', userFriendlyMessage);
        return false;
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
      downloadData,
      posthog,
    ]
  );

  // Handle visualize data - open more insights dialog
  const handleVisualizeData = useCallback(() => {
    posthog?.capture('data_visualize_clicked', {
      active_tab: activeTab,
      sites_count: selectedSiteIds.length,
      devices_count: selectedDeviceIds.length,
      grids_count: selectedGridIds.length,
    });

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
    posthog,
  ]);

  return {
    handleDownload,
    handleVisualizeData,
    isDownloading,
  };
};
