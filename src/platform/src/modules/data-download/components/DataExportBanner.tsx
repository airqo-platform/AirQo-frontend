import React from 'react';
import { CohortSitesResponse, CohortDevicesResponse } from '@/shared/types/api';
import { DateRange } from '@/shared/components/calendar/types';
import { TabType, DeviceCategory } from '../types/dataExportTypes';
import { getBannerNotification } from '../utils/bannerUtils';

interface DataExportBannerProps {
  dateRange: DateRange | undefined;
  activeTab: TabType;
  selectedSiteIds: string[];
  selectedDeviceIds: string[];
  selectedGridIds: string[];
  selectedGridSiteIds: string[];
  selectedPollutants: string[];
  deviceCategory: DeviceCategory;
  isDownloadReady: boolean;
  sitesData: CohortSitesResponse['sites'] | undefined;
  devicesData: CohortDevicesResponse['devices'] | undefined;
  isLoadingSites: boolean;
  isLoadingDevices: boolean;
  pathname: string;
}

/**
 * Banner component for displaying notifications and warnings
 */
export const DataExportBanner: React.FC<DataExportBannerProps> = ({
  dateRange,
  activeTab,
  selectedSiteIds,
  selectedDeviceIds,
  selectedGridIds,
  selectedGridSiteIds,
  selectedPollutants,
  deviceCategory,
  isDownloadReady,
  sitesData,
  devicesData,
  isLoadingSites,
  isLoadingDevices,
  pathname,
}) => {
  const banner = getBannerNotification({
    dateRange,
    activeTab,
    selectedSiteIds,
    selectedDeviceIds,
    selectedGridIds,
    selectedGridSiteIds,
    selectedPollutants,
    deviceCategory,
    isDownloadReady,
    sitesData,
    devicesData,
    isLoadingSites,
    isLoadingDevices,
    pathname,
  });

  return banner ? <div>{banner}</div> : null;
};
