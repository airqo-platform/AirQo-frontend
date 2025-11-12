import React from 'react';
import { InfoBanner, WarningBanner } from '@/shared/components/ui/banner';
import { CohortSitesResponse, CohortDevicesResponse } from '@/shared/types/api';
import { DateRange } from '@/shared/components/calendar/types';
import { TabType, DeviceCategory } from '../types/dataExportTypes';
import { LARGE_DATE_RANGE_THRESHOLD } from '../constants/dataExportConstants';

interface BannerNotificationProps {
  dateRange: DateRange | undefined;
  activeTab: TabType;
  selectedSiteIds: string[];
  selectedDeviceIds: string[];
  selectedGridIds: string[];
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
 * Determines which banner notification to show based on current state
 */
export const getBannerNotification = ({
  dateRange,
  activeTab,
  selectedSiteIds,
  selectedDeviceIds,
  selectedGridIds,
  selectedPollutants,
  deviceCategory,
  isDownloadReady,
  sitesData,
  devicesData,
  isLoadingSites,
  isLoadingDevices,
  pathname,
}: BannerNotificationProps): React.ReactNode | null => {
  // Only show "No Data" banner for organization routes and when not loading
  const isOrgRoute = pathname.startsWith('/org/');
  const hasNoSites = !sitesData || sitesData.length === 0;
  const hasNoDevices = !devicesData || devicesData.length === 0;

  if (
    isOrgRoute &&
    !isLoadingSites &&
    !isLoadingDevices &&
    hasNoSites &&
    hasNoDevices
  ) {
    const vertexUrl =
      process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS === 'staging'
        ? 'https://staging-vertex.airqo.net/'
        : 'https://vertex.airqo.net/';

    return (
      <InfoBanner
        title="No Data Available"
        message={
          <div className="space-y-2">
            <p>
              It appears you haven&apos;t deployed any devices or configured
              monitoring sites yet. To start collecting air quality data,
              you&apos;ll need to deploy devices through our platform.
            </p>
            <p>
              <a
                href={vertexUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline font-medium"
              >
                Visit AirQo Vertex
              </a>{' '}
              to deploy devices and configure your monitoring network.
            </p>
          </div>
        }
      />
    );
  }

  // Check for missing required selections - use warning severity
  if (!dateRange?.from || !dateRange?.to) {
    return (
      <WarningBanner
        title="Date Range Required"
        message="Please select a date range to continue with your data export. This ensures you get the most relevant data for your analysis."
      />
    );
  }

  const hasSelections =
    activeTab === 'sites'
      ? selectedSiteIds.length > 0
      : activeTab === 'devices'
        ? selectedDeviceIds.length > 0
        : selectedGridIds.length > 0; // countries and cities use grid IDs

  if (!hasSelections) {
    const locationTypeLabel =
      activeTab === 'sites'
        ? 'site'
        : activeTab === 'devices'
          ? 'device'
          : activeTab === 'countries'
            ? 'country'
            : 'city';

    return (
      <WarningBanner
        title="Location Selection Required"
        message={`Please select at least one ${locationTypeLabel} to include in your data export.`}
      />
    );
  }

  if (selectedPollutants.length === 0) {
    return (
      <WarningBanner
        title="Pollutant Selection Required"
        message="Choose at least one air quality parameter to include in your export for meaningful analysis."
      />
    );
  }

  // Check for large date ranges (more than 90 days) - use warning
  if (dateRange?.from && dateRange?.to) {
    const daysDifference = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysDifference > LARGE_DATE_RANGE_THRESHOLD) {
      return (
        <WarningBanner
          title="Large Date Range Detected"
          message="Large date ranges may take longer to process. Consider breaking your request into smaller batches for faster results."
        />
      );
    }
  }

  // Special guidance for BAM devices - use info
  if (activeTab === 'devices' && deviceCategory === 'bam') {
    return (
      <InfoBanner
        title="BAM Device Data Available"
        message="BAM devices provide high-quality reference data with all frequency options available for detailed analysis."
      />
    );
  }

  // Success state when everything is ready - use info
  if (isDownloadReady) {
    return (
      <InfoBanner
        title="Ready to Export"
        message="Your data export configuration is complete. Click 'Download Data' to start the export process."
      />
    );
  }

  return null;
};
