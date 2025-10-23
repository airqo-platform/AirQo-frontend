import React, { useMemo, useState, useEffect } from 'react';
import ReusableDialog from '@/shared/components/ui/dialog';
import { DateRange } from '@/shared/components/calendar/types';
import {
  FREQUENCY_LABELS,
  DATA_TYPE_LABELS,
} from '@/shared/components/charts/constants';
import { InfoBanner } from '@/shared/components/ui/banner';

interface DataExportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDownloading: boolean;

  // Export configuration
  dataType: string;
  frequency: string;
  fileType: string;
  selectedPollutants: string[];
  dateRange: DateRange | undefined;
  activeTab: 'sites' | 'devices';
  selectedSites: string[];
  selectedDevices: string[];
  deviceCategory: string;
}

interface PreviewData {
  [key: string]: string | number | null;
}

export const DataExportPreview: React.FC<DataExportPreviewProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDownloading,
  dataType,
  frequency,
  fileType,
  selectedPollutants,
  dateRange,
  activeTab,
  selectedSites,
  selectedDevices,
  deviceCategory,
}) => {
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Format date range for display
  const formattedDateRange = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 'Not selected';

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
  }, [dateRange]);

  // Calculate estimated days
  const estimatedDays = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0;

    const diffTime = Math.abs(
      dateRange.to.getTime() - dateRange.from.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [dateRange]);

  // Get selected locations
  const selectedLocations =
    activeTab === 'sites' ? selectedSites : selectedDevices;
  const locationType = activeTab === 'sites' ? 'Sites' : 'Devices';

  // Fetch preview data when dialog opens
  useEffect(() => {
    if (
      isOpen &&
      dateRange?.from &&
      dateRange?.to &&
      selectedLocations.length > 0 &&
      selectedPollutants.length > 0
    ) {
      const fetchPreviewData = async () => {
        setPreviewLoading(true);
        setPreviewError(null);

        try {
          // For preview, we'll simulate getting data or use a modified request
          // Since we can't actually download for preview, we'll show sample structure
          const sampleData: PreviewData[] = [
            {
              site_name: selectedLocations[0] || 'Sample Site',
              datetime: dateRange?.from
                ? dateRange.from
                    .toISOString()
                    .replace('T', ' ')
                    .replace('Z', '')
                : '',
              device_name:
                activeTab === 'devices'
                  ? selectedDevices[0] || 'sample_device'
                  : 'airqo_g5293',
              frequency: frequency,
              network: 'airqo',
              latitude: 0.3244820075131162,
              longitude: 32.571073376413565,
              temperature: 25.83641260890321,
              humidity: 72.06045440983412,
              pm2_5: 36.37,
              pm2_5_calibrated_value: 36.37,
              pm10: 46.42,
              pm10_calibrated_value: 46.42,
            },
            {
              site_name: selectedLocations[0] || 'Sample Site',
              datetime: dateRange?.from
                ? new Date(dateRange.from.getTime() + 24 * 60 * 60 * 1000)
                    .toISOString()
                    .replace('T', ' ')
                    .replace('Z', '')
                : '',
              device_name:
                activeTab === 'devices'
                  ? selectedDevices[0] || 'sample_device'
                  : 'airqo_g5293',
              frequency: frequency,
              network: 'airqo',
              latitude: 0.3244820075131162,
              longitude: 32.571073376413565,
              temperature: 26.85111111111112,
              humidity: 63.484772961816304,
              pm2_5: 30.97,
              pm2_5_calibrated_value: 27.95,
              pm10: 42.11,
              pm10_calibrated_value: 38.94,
            },
          ];

          // Filter to only show selected pollutants
          const filteredData = sampleData.map(row => {
            const filteredRow: PreviewData = {
              datetime: row.datetime,
              site_name: row.site_name,
              device_name: row.device_name,
              frequency: row.frequency,
              network: row.network,
            };

            // Add selected pollutants
            selectedPollutants.forEach(pollutant => {
              if (row[pollutant] !== undefined) {
                filteredRow[pollutant] = row[pollutant];
                filteredRow[`${pollutant}_calibrated_value`] =
                  row[`${pollutant}_calibrated_value`];
              }
            });

            // Add weather fields if selected
            if (row.temperature !== undefined)
              filteredRow.temperature = row.temperature;
            if (row.humidity !== undefined) filteredRow.humidity = row.humidity;

            // Add location fields
            if (row.latitude !== undefined) filteredRow.latitude = row.latitude;
            if (row.longitude !== undefined)
              filteredRow.longitude = row.longitude;

            return filteredRow;
          });

          setPreviewData(filteredData.slice(0, 5)); // Show max 5 rows
        } catch (error) {
          setPreviewError('Failed to load preview data');
          console.error('Preview data fetch error:', error);
        } finally {
          setPreviewLoading(false);
        }
      };

      fetchPreviewData();
    }
  }, [
    isOpen,
    dateRange,
    selectedLocations,
    selectedPollutants,
    dataType,
    frequency,
    activeTab,
    deviceCategory,
    selectedSites,
    selectedDevices,
  ]);

  // Get table columns based on preview data
  const tableColumns = useMemo(() => {
    if (previewData.length === 0) return [];

    const firstRow = previewData[0];
    return Object.keys(firstRow).map(key => ({
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      render: (value: string | number | null) => {
        if (typeof value === 'number') {
          return value.toFixed(2);
        }
        return String(value ?? '');
      },
    }));
  }, [previewData]);

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Export Preview"
      subtitle="Review your data export configuration and preview sample data"
      size="2xl"
      maxHeight="max-h-[90vh]"
      primaryAction={{
        label: isDownloading ? 'Downloading...' : 'Confirm & Download',
        onClick: onConfirm,
        disabled: isDownloading,
        loading: isDownloading,
        variant: 'filled',
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        variant: 'outlined',
      }}
    >
      <div className="space-y-6">
        {/* Configuration Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Export Configuration Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Data Type:
              </span>
              <p className="text-gray-900 dark:text-gray-100 mt-1">
                {DATA_TYPE_LABELS[dataType as keyof typeof DATA_TYPE_LABELS] ||
                  dataType}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Frequency:
              </span>
              <p className="text-gray-900 dark:text-gray-100 mt-1">
                {FREQUENCY_LABELS[frequency as keyof typeof FREQUENCY_LABELS] ||
                  frequency}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Format:
              </span>
              <p className="text-gray-900 dark:text-gray-100 mt-1 uppercase">
                {fileType}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {locationType}:
              </span>
              <p className="text-gray-900 dark:text-gray-100 mt-1">
                {selectedLocations.length}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Date Range: {formattedDateRange}</span>
              <span>Estimated Days: {estimatedDays}</span>
            </div>
          </div>
        </div>

        {/* Data Preview */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Data Preview (Sample Rows)
          </h3>

          {previewLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Loading preview data...
              </div>
            </div>
          ) : previewError ? (
            <InfoBanner
              title="Preview Unavailable"
              message="Unable to load preview data. You can still proceed with the export."
            />
          ) : previewData.length > 0 ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      {tableColumns.map(column => (
                        <th
                          key={column.key}
                          className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        {tableColumns.map(column => (
                          <td
                            key={column.key}
                            className="px-3 py-2 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                          >
                            {column.render(row[column.key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-gray-600 dark:text-gray-400">
              No preview data available
            </div>
          )}
        </div>

        {/* Export Notes */}
        <InfoBanner
          message={`This preview shows sample data. Your actual export will include all ${selectedLocations.length} ${locationType.toLowerCase()} and ${estimatedDays} days of data in ${fileType.toUpperCase()} format.`}
        />
      </div>
    </ReusableDialog>
  );
};
