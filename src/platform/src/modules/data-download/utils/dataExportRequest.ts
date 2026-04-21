import { DateRange } from '@/shared/components/calendar/types';
import { DataDownloadRequest } from '@/shared/types/api';
import { DeviceCategory, TabType } from '../types/dataExportTypes';

interface BuildDataDownloadRequestArgs {
  dateRange: DateRange | undefined;
  activeTab: TabType;
  selectedSites: string[];
  selectedDeviceIds: string[];
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

const resolveGridSitesForDownload = (
  selectedGridIds: string[],
  selectedGridSites: Record<string, string[]>,
  selectedGridSiteIds: Record<string, string[]>
) => {
  const sitesForDownload: string[] = [];

  selectedGridIds.forEach(gridId => {
    const customSites = selectedGridSiteIds[gridId];
    const defaultSites = selectedGridSites[gridId];
    const sites =
      customSites && customSites.length > 0 ? customSites : defaultSites || [];

    sitesForDownload.push(...sites);
  });

  return sitesForDownload;
};

export const buildDataDownloadRequest = ({
  dateRange,
  activeTab,
  selectedSites,
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
}: BuildDataDownloadRequestArgs): DataDownloadRequest => {
  if (!dateRange?.from || !dateRange?.to) {
    throw new Error('Date range is required for data export');
  }

  const effectiveDataType: DataDownloadRequest['datatype'] =
    activeTab === 'devices' && deviceCategory === 'bam'
      ? 'raw'
      : (dataType as DataDownloadRequest['datatype']);

  const effectiveGridSiteIds = customSelectedGridSiteIds || selectedGridSiteIds;

  const sitesForDownload = resolveGridSitesForDownload(
    selectedGridIds,
    selectedGridSites,
    effectiveGridSiteIds
  );

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
    ...(activeTab === 'sites' && { sites: selectedSites }),
    ...(activeTab === 'devices' && { device_ids: selectedDeviceIds }),
    ...((activeTab === 'countries' || activeTab === 'cities') && {
      sites: sitesForDownload,
    }),
  };
};
