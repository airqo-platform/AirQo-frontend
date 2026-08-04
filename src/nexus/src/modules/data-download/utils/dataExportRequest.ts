import { DateRange } from '@/shared/components/calendar/types';
import { DataDownloadRequest } from '@/shared/types/api';
import { DeviceCategory, TabType } from '../types/dataExportTypes';

interface BuildDataDownloadRequestArgs {
  dateRange: DateRange | undefined;
  activeTab: TabType;
  /** Human-readable site names are intentionally not used for site exports. */
  selectedSites?: string[];
  selectedSiteIds: string[];
  selectedDeviceIds: string[];
  selectedDeviceNames?: string[];
  selectedGridIds: string[];
  selectedGridSites: Record<string, string[]>;
  selectedGridSiteIds: Record<string, string[]>;
  customSelectedGridSiteIds?: Record<string, string[]>;
  selectedPollutants: string[];
  dataType: string;
  fileType: string;
  frequency: string;
  deviceCategory: DeviceCategory;
}

const toUtcDayStartIso = (date: Date) =>
  new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
  ).toISOString();

const toUtcDayEndIso = (date: Date) =>
  new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    )
  ).toISOString();

const normalizeSelection = (values: string[] | undefined): string[] =>
  Array.from(
    new Set((values ?? []).map(value => String(value).trim()).filter(Boolean))
  );

export const resolveGridSitesForDownload = (
  selectedGridIds: string[],
  selectedGridSites: Record<string, string[]>,
  selectedGridSiteIds: Record<string, string[]>
) =>
  normalizeSelection(
    selectedGridIds.flatMap(gridId => {
      const hasCustomSelection = Object.prototype.hasOwnProperty.call(
        selectedGridSiteIds,
        gridId
      );

      // An explicit custom selection, including [], is authoritative. Never
      // silently turn an intentional empty selection back into "all sites".
      return hasCustomSelection
        ? (selectedGridSiteIds[gridId] ?? [])
        : (selectedGridSites[gridId] ?? []);
    })
  );

const getDeviceSelector = (
  selectedDeviceIds: string[],
  selectedDeviceNames?: string[]
): { device_ids: string[] } | { device_names: string[] } => {
  const deviceIds = normalizeSelection(selectedDeviceIds);
  const deviceNames = normalizeSelection(selectedDeviceNames);

  // Names are only safe when they map one-to-one to the current selection.
  // Otherwise use IDs, which are the authoritative table selection values.
  if (deviceNames.length === deviceIds.length && deviceNames.length > 0) {
    return { device_names: deviceNames };
  }

  if (deviceIds.length > 0) {
    return { device_ids: deviceIds };
  }

  throw new Error(
    'At least one device ID or device name is required for export'
  );
};

export const buildDataDownloadRequest = ({
  dateRange,
  activeTab,
  selectedSiteIds,
  selectedDeviceIds,
  selectedGridIds,
  selectedGridSites,
  selectedGridSiteIds,
  customSelectedGridSiteIds,
  selectedPollutants,
  dataType,
  fileType,
  frequency,
  deviceCategory,
  selectedDeviceNames,
}: BuildDataDownloadRequestArgs): DataDownloadRequest => {
  if (!dateRange?.from || !dateRange?.to) {
    throw new Error('Date range is required for data export');
  }

  const effectiveDataType: DataDownloadRequest['datatype'] =
    activeTab === 'devices' && deviceCategory === 'bam'
      ? 'raw'
      : (dataType as DataDownloadRequest['datatype']);

  const normalizedSiteIds = normalizeSelection(selectedSiteIds);
  const effectiveGridSiteIds = customSelectedGridSiteIds ?? selectedGridSiteIds;

  const sitesForDownload = resolveGridSitesForDownload(
    selectedGridIds,
    selectedGridSites,
    effectiveGridSiteIds
  );

  const selection =
    activeTab === 'sites'
      ? normalizedSiteIds.length > 0
        ? { sites: normalizedSiteIds }
        : (() => {
            throw new Error('At least one site ID is required for export');
          })()
      : activeTab === 'devices'
        ? getDeviceSelector(selectedDeviceIds, selectedDeviceNames)
        : sitesForDownload.length > 0
          ? { sites: sitesForDownload }
          : (() => {
              throw new Error(
                'At least one monitoring site is required for country or city export'
              );
            })();

  return {
    datatype: effectiveDataType,
    downloadType: fileType as DataDownloadRequest['downloadType'],
    startDateTime: toUtcDayStartIso(dateRange.from),
    endDateTime: toUtcDayEndIso(dateRange.to),
    frequency: frequency as DataDownloadRequest['frequency'],
    minimum: true,
    metaDataFields: ['latitude', 'longitude'],
    weatherFields: ['temperature', 'humidity'],
    outputFormat: 'airqo-standard',
    pollutants: selectedPollutants,
    device_category:
      activeTab === 'countries' || activeTab === 'cities'
        ? 'lowcost'
        : deviceCategory,
    ...selection,
  };
};
