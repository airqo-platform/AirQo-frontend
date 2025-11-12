import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { openMoreInsights } from '@/shared/store/insightsSlice';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { useDataDownload } from '@/modules/analytics/hooks';
import { DataDownloadRequest } from '@/shared/types/api';
import { DateRange } from '@/shared/components/calendar/types';
import { TabType, DeviceCategory, TableItem } from '../types/dataExportTypes';
import {
  createSitesForVisualization,
  createSitesFromDevicesForVisualization,
  createSitesFromGridsForVisualization,
} from '../utils/dataExportUtils';

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
  selectedGridSites: string[],
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
  const { downloadData, isDownloading } = useDataDownload();

  // Handle data download
  const handleDownload = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error(
        'Date Range Required',
        'Please select a date range for data export.'
      );
      return;
    }

    if (activeTab === 'sites' && selectedSiteIds.length === 0) {
      toast.error(
        'Site Selection Required',
        'Please select at least one site for data export.'
      );
      return;
    }

    if (activeTab === 'devices' && selectedDeviceIds.length === 0) {
      toast.error(
        'Device Selection Required',
        'Please select at least one device for data export.'
      );
      return;
    }

    if (
      (activeTab === 'countries' || activeTab === 'cities') &&
      selectedGridIds.length === 0
    ) {
      toast.error(
        `${activeTab === 'countries' ? 'Country' : 'City'} Selection Required`,
        `Please select one ${activeTab === 'countries' ? 'country' : 'city'} for data export.`
      );
      return;
    }

    if (selectedPollutants.length === 0) {
      toast.error(
        'Pollutant Selection Required',
        'Please select at least one pollutant for data export.'
      );
      return;
    }

    // Extract sites for countries/cities
    let sitesForDownload: string[] = [];
    if (activeTab === 'countries' || activeTab === 'cities') {
      // Use cached site IDs to avoid issues when search/pagination changes after selection
      sitesForDownload = selectedGridSites;
    }

    const request: DataDownloadRequest = {
      datatype: dataType as 'calibrated' | 'raw',
      downloadType: fileType as 'csv' | 'json',
      startDateTime: dateRange.from.toISOString(),
      endDateTime: dateRange.to.toISOString(),
      frequency: frequency as 'daily',
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
      ...(activeTab === 'devices' && { device_names: selectedDevices }),
      ...((activeTab === 'countries' || activeTab === 'cities') && {
        sites: sitesForDownload,
      }),
    };

    try {
      await downloadData(request, fileTitle || undefined);
      toast.success(
        'Download Started',
        'Your data export has been initiated successfully.'
      );
    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = getUserFriendlyErrorMessage(error);
      toast.error('Download Failed', errorMessage);
    }
  }, [
    dateRange,
    activeTab,
    selectedSites,
    selectedDevices,
    selectedSiteIds,
    selectedDeviceIds,
    selectedGridIds,
    selectedGridSites,
    selectedPollutants,
    dataType,
    fileType,
    frequency,
    deviceCategory,
    fileTitle,
    downloadData,
  ]);

  // Handle visualize data - open more insights dialog
  const handleVisualizeData = useCallback(() => {
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

  return {
    handleDownload,
    handleVisualizeData,
    isDownloading,
  };
};
