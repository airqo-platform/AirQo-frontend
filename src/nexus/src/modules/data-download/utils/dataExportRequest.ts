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
): { device_ids: string[] } => {
  const deviceIds = normalizeSelection(selectedDeviceIds);

  if (deviceIds.length > 0) {
    return { device_ids: deviceIds };
  }

  // The analytics API documents `device_names` as a legacy alias that is
  // resolved against the device_id column, not human-readable names. Never
  // send the UI labels as that selector.
  void selectedDeviceNames;
  throw new Error(
    'At least one device ID is required for device export'
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
      : frequency === 'raw'
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
    // `minimum: true` excludes metadata and weather on the API. The export
    // UI requests those context fields, so keep the documented default false.
    minimum: false,
    // Keep the canonical site identity in the response so availability
    // checks do not have to rely on display-name equality.
    metaDataFields: ['latitude', 'longitude', 'site_id'],
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
