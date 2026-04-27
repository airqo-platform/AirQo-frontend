import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Checkbox from '@/shared/components/ui/checkbox';
import ReusableDialog from '@/shared/components/ui/dialog';
import { DateRange } from '@/shared/components/calendar/types';
import {
  FREQUENCY_LABELS,
  DATA_TYPE_LABELS,
} from '@/shared/components/charts/constants';
import { InfoBanner } from '@/shared/components/ui/banner';
import { areArraysEqual } from '@/shared/utils/arrays';
import {
  getDefaultDownloadColumnKeys,
  getDownloadColumnGroups,
  getDownloadColumnLabelMap,
} from '../utils/dataExportFile';

interface DataExportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedColumnKeys: string[]) => void;
  isDownloading: boolean;

  // Export configuration
  dataType: string;
  frequency: string;
  fileType: string;
  selectedPollutants: string[];
  dateRange: DateRange | undefined;
  activeTab: 'sites' | 'devices' | 'countries' | 'cities';
  selectedSites: string[];
  selectedDevices: string[];
  selectedGridIds: string[];
  selectedGridSites: Record<string, string[]>;
  selectedGridSiteIds: Record<string, string[]>;
}

type PreviewData = Record<string, string | number | null>;

const SAMPLE_POLLUTANT_VALUES: Record<string, [number, number]> = {
  pm2_5: [36.37, 30.97],
  pm10: [46.42, 42.11],
  no2: [18.27, 16.81],
  so2: [8.12, 7.44],
  o3: [22.54, 23.71],
  co: [0.82, 0.74],
};

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
  selectedGridIds,
  selectedGridSites,
  selectedGridSiteIds,
}) => {
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(() =>
    getDefaultDownloadColumnKeys(activeTab, selectedPollutants)
  );
  const previousOpenRef = useRef(false);

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

  const estimatedDays = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0;

    const diffTime = Math.abs(
      dateRange.to.getTime() - dateRange.from.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [dateRange]);

  const columnGroups = useMemo(
    () => getDownloadColumnGroups(activeTab, selectedPollutants),
    [activeTab, selectedPollutants]
  );

  const columnLabelMap = useMemo(
    () => getDownloadColumnLabelMap(activeTab, selectedPollutants),
    [activeTab, selectedPollutants]
  );

  const defaultColumnKeys = useMemo(
    () => getDefaultDownloadColumnKeys(activeTab, selectedPollutants),
    [activeTab, selectedPollutants]
  );

  const selectedLocations = useMemo(() => {
    switch (activeTab) {
      case 'sites':
        return selectedSites;
      case 'devices':
        return selectedDevices;
      case 'countries':
      case 'cities': {
        const customSites = Object.values(selectedGridSiteIds).flat();
        if (customSites.length > 0) {
          return customSites;
        }
        return Object.values(selectedGridSites).flat();
      }
      default:
        return [];
    }
  }, [
    activeTab,
    selectedSites,
    selectedDevices,
    selectedGridSites,
    selectedGridSiteIds,
  ]);

  const locationType = useMemo(() => {
    switch (activeTab) {
      case 'sites':
        return 'Sites';
      case 'devices':
        return 'Devices';
      case 'countries':
      case 'cities':
        return 'Sites';
      default:
        return 'Locations';
    }
  }, [activeTab]);

  const locationColumnKey = useMemo(() => {
    switch (activeTab) {
      case 'sites':
        return 'site_name';
      case 'devices':
        return 'device_name';
      case 'countries':
        return 'country_name';
      case 'cities':
        return 'city_name';
      default:
        return 'site_name';
    }
  }, [activeTab]);

  const locationSampleValue = useMemo(() => {
    switch (activeTab) {
      case 'sites':
        return selectedSites[0] || 'Sample Site';
      case 'devices':
        return selectedDevices[0] || 'sample_device';
      case 'countries':
        return selectedGridIds[0] || 'Sample Country';
      case 'cities':
        return selectedGridIds[0] || 'Sample City';
      default:
        return 'Sample Location';
    }
  }, [activeTab, selectedDevices, selectedGridIds, selectedSites]);

  useEffect(() => {
    if (isOpen && !previousOpenRef.current) {
      setSelectedColumnKeys(prev =>
        areArraysEqual(prev, defaultColumnKeys) ? prev : defaultColumnKeys
      );
    }

    previousOpenRef.current = isOpen;
  }, [defaultColumnKeys, isOpen]);

  const handleColumnToggle = useCallback((key: string, checked: boolean) => {
    setSelectedColumnKeys(prev => {
      if (checked) {
        return prev.includes(key) ? prev : [...prev, key];
      }

      return prev.filter(columnKey => columnKey !== key);
    });
  }, []);

  const sampleRows = useMemo<PreviewData[]>(() => {
    if (!dateRange?.from) {
      return [];
    }

    const baseDate = dateRange.from;

    const createSampleDate = (index: number) => {
      const sampleDate = new Date(baseDate);

      switch (frequency) {
        case 'raw':
        case 'hourly':
          sampleDate.setHours(sampleDate.getHours() + index);
          break;
        case 'weekly':
          sampleDate.setDate(sampleDate.getDate() + index * 7);
          break;
        case 'monthly':
          sampleDate.setMonth(sampleDate.getMonth() + index);
          break;
        default:
          sampleDate.setDate(sampleDate.getDate() + index);
          break;
      }

      return sampleDate;
    };

    return [0, 1].map(index => {
      const sampleDate = createSampleDate(index);

      const row: PreviewData = {
        [locationColumnKey]: locationSampleValue,
        datetime: sampleDate.toISOString().replace('T', ' ').replace('Z', ''),
        frequency,
        network: 'airqo',
        latitude: 0.3244820075131162,
        longitude: 32.571073376413565,
        temperature: index === 0 ? 25.83641260890321 : 26.85111111111112,
        humidity: index === 0 ? 72.06045440983412 : 63.484772961816304,
      };

      selectedPollutants.forEach(pollutant => {
        const values = SAMPLE_POLLUTANT_VALUES[pollutant] || [36.37, 30.97];
        const value = index === 0 ? values[0] : values[1];

        row[pollutant] = value;
        row[`${pollutant}_calibrated_value`] = Number(
          (value * 0.92).toFixed(2)
        );
      });

      return row;
    });
  }, [
    dateRange?.from,
    frequency,
    locationColumnKey,
    locationSampleValue,
    selectedPollutants,
  ]);

  const previewColumns = useMemo(
    () =>
      selectedColumnKeys.map(key => ({
        key,
        label: columnLabelMap[key] || key,
      })),
    [columnLabelMap, selectedColumnKeys]
  );

  const previewData = useMemo(() => {
    if (selectedColumnKeys.length === 0) {
      return [];
    }

    return sampleRows.map(row => {
      const filteredRow: PreviewData = {};

      selectedColumnKeys.forEach(key => {
        filteredRow[key] = row[key] ?? '';
      });

      return filteredRow;
    });
  }, [sampleRows, selectedColumnKeys]);

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Export Preview"
      subtitle="Choose the columns you want to keep before downloading."
      size="2xl"
      primaryAction={{
        label: isDownloading ? 'Downloading...' : 'Confirm & Download',
        onClick: () => onConfirm(selectedColumnKeys),
        disabled: isDownloading || selectedColumnKeys.length === 0,
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
        <InfoBanner
          title="Metadata fallback enabled"
          message="If the selected filters return no readings, the download automatically falls back to metadata for the selected locations."
        />

        {/* Download Columns */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm text-gray-900 dark:text-gray-100">
              Download Columns
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Turn columns on or off to match the file you want.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {columnGroups.map(group => (
              <div
                key={group.id}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {group.title}
                </h4>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {group.options.map(option => (
                    <label
                      key={option.key}
                      className="flex items-start gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/60"
                    >
                      <Checkbox
                        checked={selectedColumnKeys.includes(option.key)}
                        onCheckedChange={checked =>
                          handleColumnToggle(option.key, checked === true)
                        }
                        className="mt-0.5"
                      />
                      <span className="leading-5 text-gray-900 dark:text-gray-100">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedColumnKeys.length === 0 && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Select at least one column to enable the download.
            </p>
          )}
        </div>

        {/* Configuration Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm text-gray-900 dark:text-gray-100 mb-3">
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
                Response Format:
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
            <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span>Date Range: {formattedDateRange}</span>
              <span>Estimated Days: {estimatedDays}</span>
              <span>Selected Columns: {selectedColumnKeys.length}</span>
            </div>
          </div>
        </div>

        {/* Data Preview */}
        <div>
          <h3 className="text-sm text-gray-900 dark:text-gray-100 mb-3">
            Data Preview (Sample Rows)
          </h3>

          {selectedColumnKeys.length === 0 ? (
            <InfoBanner
              title="Preview Unavailable"
              message="Select at least one column above to preview the export output."
            />
          ) : previewData.length > 0 ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      {previewColumns.map(column => (
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
                        {previewColumns.map(column => (
                          <td
                            key={column.key}
                            className="px-3 py-2 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                          >
                            {typeof row[column.key] === 'number'
                              ? Number(row[column.key]).toFixed(2)
                              : String(row[column.key] ?? '')}
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
          message={`This preview is for the file setup only. Your download will use the same data selection and keep only the columns you choose here.`}
        />
      </div>
    </ReusableDialog>
  );
};
