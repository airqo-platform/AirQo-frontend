import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { usePostHog } from 'posthog-js/react';
import { openMoreInsights } from '@/shared/store/insightsSlice';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { trackEvent } from '@/shared/utils/analytics';
import { trackDataDownload } from '@/shared/utils/enhancedAnalytics';
import { useDataDownload } from '@/modules/analytics/hooks';
import { DataDownloadRequest } from '@/shared/types/api';
import { DateRange } from '@/shared/components/calendar/types';
import { TabType, DeviceCategory, TableItem } from '../types/dataExportTypes';
import {
  createSitesForVisualization,
  createSitesFromDevicesForVisualization,
  createSitesFromGridsForVisualization,
} from '../utils/dataExportUtils';
import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  status?: string;
  message?: string;
  data?: unknown;
  metadata?: unknown;
}

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

  // Handle data download
  const handleDownload = useCallback(
    async (customSelectedGridSiteIds?: Record<string, string[]>) => {
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
        Object.keys(selectedGridSiteIds).length === 0 &&
        Object.keys(selectedGridSites).length === 0
      ) {
        toast.error(
          `${activeTab === 'countries' ? 'Country' : 'City'} Selection Required`,
          `Please select a ${activeTab === 'countries' ? 'country' : 'city'} for data export.`
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

        // Enhanced analytics tracking with comprehensive details
        const durationDays = Math.ceil(
          (dateRange.to.getTime() - dateRange.from.getTime()) /
            (1000 * 60 * 60 * 24)
        );

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
          dataType: dataType as 'calibrated' | 'raw',
          fileType: fileType as 'csv' | 'json',
          frequency: frequency as 'hourly' | 'daily' | 'monthly',
          pollutants: selectedPollutants,
          locationCount: effectiveLocationCount,
          deviceCount:
            activeTab === 'devices' ? selectedDevices.length : undefined,
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
          durationDays,
          deviceCategory: effectiveDeviceCategory as 'lowcost' | 'reference',
          source: activeTab,
        });

        toast.success(
          'Download Started',
          'Your data export has been initiated successfully.'
        );
      } catch (error) {
        console.error('Download failed:', error);

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
