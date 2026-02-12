import React, { useCallback, useMemo } from 'react';
import { AqDownload01 } from '@airqo/icons-react';

import ReusableDialog from '@/shared/components/ui/dialog';
import { Radio } from '@/shared/components/ui/radio';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAnalyticsPreferences, useDataDownload } from '../hooks';
import type { FrequencyType } from '@/shared/components/charts/types';
import {
  FREQUENCY_LABELS,
  POLLUTANT_LABELS,
} from '@/shared/components/charts/constants';

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDataType: 'calibrated' | 'raw';
  onDataTypeChange: (type: 'calibrated' | 'raw') => void;
}

export const DownloadDialog: React.FC<DownloadDialogProps> = ({
  isOpen,
  onClose,
  selectedDataType,
  onDataTypeChange,
}) => {
  const { filters } = useAnalytics();
  const { selectedSiteIds, selectedSites } = useAnalyticsPreferences();
  const { downloadData, isDownloading } = useDataDownload();

  // Memoized data type change handler to prevent unnecessary re-renders
  const handleDataTypeChange = useCallback(
    (type: 'calibrated' | 'raw') => {
      onDataTypeChange(type);
    },
    [onDataTypeChange]
  );

  const handleConfirmDownload = useCallback(async () => {
    if (selectedSiteIds.length === 0) {
      toast.error(
        'No Sites Selected',
        'Please select at least one site to download data.'
      );
      return;
    }

    // Ensure dates are in the exact format required by backend: "2025-07-20T00:00:00.000Z"
    let startDateTime: string;
    let endDateTime: string;

    try {
      // Create start date (beginning of day)
      const startDate = new Date(filters.startDate);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start date');
      }
      startDate.setUTCHours(0, 0, 0, 0); // Use UTC to ensure consistent timezone
      startDateTime = startDate.toISOString();

      // Create end date (end of day)
      const endDate = new Date(filters.endDate);
      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid end date');
      }
      endDate.setUTCHours(23, 59, 59, 999); // Use UTC to ensure consistent timezone
      endDateTime = endDate.toISOString();
    } catch (dateError) {
      toast.error(
        'Date Error',
        'Invalid date format detected. Please select dates again.'
      );
      console.error('Date parsing error:', dateError, {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      return;
    }

    // Validate date formats before sending
    if (!startDateTime.includes('T') || !startDateTime.endsWith('Z')) {
      toast.error(
        'Invalid Date Format',
        'Start date is not in the correct timezone-aware format.'
      );
      return;
    }
    if (!endDateTime.includes('T') || !endDateTime.endsWith('Z')) {
      toast.error(
        'Invalid Date Format',
        'End date is not in the correct timezone-aware format.'
      );
      return;
    }

    const request = {
      datatype: selectedDataType,
      downloadType: 'csv' as const,
      endDateTime,
      frequency: filters.frequency as 'daily',
      minimum: true,
      outputFormat: 'airqo-standard' as const,
      pollutants: [filters.pollutant],
      metaDataFields: ['latitude', 'longitude'],
      weatherFields: ['temperature', 'humidity'],
      startDateTime,
      sites: selectedSiteIds,
      device_category: 'lowcost' as const,
    };

    // Verify format matches exactly what backend expects: "2025-07-20T00:00:00.000Z"
    const expectedPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (!expectedPattern.test(startDateTime)) {
      console.error('startDateTime format invalid:', startDateTime);
      toast.error(
        'Date Format Error',
        'Start date format is invalid for backend.'
      );
      return;
    }
    if (!expectedPattern.test(endDateTime)) {
      console.error('endDateTime format invalid:', endDateTime);
      toast.error(
        'Date Format Error',
        'End date format is invalid for backend.'
      );
      return;
    }

    try {
      await downloadData(request);
      toast.success(
        'Download Started',
        'Your data download has been initiated successfully. The file will be downloaded shortly.'
      );
      onClose();
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      toast.error('Download Failed', errorMessage);
      console.error('Failed to download data:', error);
      console.error('Request that failed:', request);
    }
  }, [
    selectedSiteIds,
    filters.startDate,
    filters.endDate,
    filters.frequency,
    filters.pollutant,
    selectedDataType,
    downloadData,
    onClose,
  ]);

  // Memoized frequency options - exclude 'raw' as requested
  const frequencyOptions = useMemo(
    () =>
      Object.entries(FREQUENCY_LABELS)
        .filter(([key]) => key !== 'raw')
        .map(([value, label]) => ({
          label,
          value: value as FrequencyType,
        })),
    []
  );

  // Memoized pollutant options
  const pollutantOptions = useMemo(
    () =>
      Object.entries(POLLUTANT_LABELS).map(([value, label]) => ({
        label,
        value: value.toUpperCase(),
      })),
    []
  );

  // Memoized site display data to prevent unnecessary re-renders
  const siteDisplayData = useMemo(
    () =>
      selectedSites.map(site => ({
        id: site._id,
        displayName:
          site.name ||
          site.formatted_name ||
          site.search_name ||
          site.generated_name ||
          `Site ${site._id.slice(-6)}`,
        location: site.country || site.region || site.city || '',
      })),
    [selectedSites]
  );

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Download Air Quality Data"
      subtitle="Confirm your download settings"
      icon={AqDownload01}
      size="lg"
      primaryAction={{
        loading: isDownloading,
        label: isDownloading ? 'Downloading...' : 'Download Data',
        onClick: handleConfirmDownload,
        disabled: isDownloading || selectedSiteIds.length === 0,
      }}
      primaryTooltip={
        'Download openly available air quality data for your own use'
      }
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
      }}
    >
      <div className="space-y-6">
        {/* Filter Summary */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Download Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Frequency:
              </span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {frequencyOptions.find(
                  option => option.value === filters.frequency
                )?.label || filters.frequency}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Pollutant:
              </span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {pollutantOptions.find(
                  option => option.value === filters.pollutant.toUpperCase()
                )?.label || filters.pollutant}
              </span>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Date Range:
              </span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(filters.startDate).toLocaleDateString()} to{' '}
                {new Date(filters.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Data Type Selection - Moved up */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Data Type
          </h3>
          <div className="space-y-3">
            <Radio
              name="dataType"
              value="calibrated"
              checked={selectedDataType === 'calibrated'}
              onChange={e =>
                handleDataTypeChange(e.target.value as 'calibrated' | 'raw')
              }
              label="Calibrated Data"
              description="Processed and quality-checked"
            />
            <Radio
              name="dataType"
              value="raw"
              checked={selectedDataType === 'raw'}
              onChange={e =>
                handleDataTypeChange(e.target.value as 'calibrated' | 'raw')
              }
              label="Raw Data"
              description="Unprocessed sensor readings"
            />
          </div>
        </div>

        {/* Selected Locations */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Selected Locations ({siteDisplayData.length})
          </h3>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {siteDisplayData.length > 0 ? (
              siteDisplayData.map(site => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {site.displayName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {site.location}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No favorite locations selected. Please add locations to your
                favorites first.
              </p>
            )}
          </div>
        </div>

        {/* Note */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> The data will be downloaded as a CSV file
            containing air quality measurements for your selected favorite
            locations within the specified date range and frequency.
          </p>
        </div>
      </div>
    </ReusableDialog>
  );
};

export default DownloadDialog;
