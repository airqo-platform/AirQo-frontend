import React, { useCallback, useMemo, useState } from 'react';
import Checkbox from '@/shared/components/ui/checkbox';
import { Button } from '@/shared/components/ui';
import ReusableDialog from '@/shared/components/ui/dialog';
import { DateRange } from '@/shared/components/calendar/types';
import {
  FREQUENCY_LABELS,
  DATA_TYPE_LABELS,
} from '@/shared/components/charts/constants';
import { InfoBanner } from '@/shared/components/ui/banner';
import { areArraysEqual } from '@/shared/utils/arrays';
import { AqAlertTriangle, AqSearchMd } from '@airqo/icons-react';
import {
  getDefaultDownloadColumnKeys,
  getDownloadColumnGroups,
  getDownloadColumnLabelMap,
} from '../utils/dataExportFile';

type PreviewData = Record<string, string | number | null>;

export interface PartialDataWarning {
  totalSelected: number;
  withData: number;
  missingNames: string[];
}

interface DataExportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedColumnKeys: string[]) => void;
  onRetryPreview: () => void;
  isDownloading: boolean;

  // Preview data fetched by parent before dialog opened
  previewRows: PreviewData[];
  isFetchingPreview: boolean;
  previewError: string | null;
  partialDataWarning?: PartialDataWarning;

  // Export configuration
  dataType: string;
  frequency: string;
  fileType: string;
  selectedPollutants: string[];
  dateRange: DateRange | undefined;
  activeTab: 'sites' | 'devices' | 'countries' | 'cities';
  selectedSites: string[];
  selectedDevices: string[];
  selectedGridSites: Record<string, string[]>;
  selectedGridSiteIds: Record<string, string[]>;
}

export const DataExportPreview: React.FC<DataExportPreviewProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onRetryPreview,
  isDownloading,
  previewRows,
  isFetchingPreview,
  previewError,
  partialDataWarning,
  dataType,
  frequency,
  fileType,
  selectedPollutants,
  dateRange,
  activeTab,
  selectedSites,
  selectedDevices,
  selectedGridSites,
  selectedGridSiteIds,
}) => {
  const defaultColumnKeys = useMemo(
    () => getDefaultDownloadColumnKeys(activeTab, selectedPollutants, dataType),
    [activeTab, dataType, selectedPollutants]
  );

  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(() =>
    getDefaultDownloadColumnKeys(activeTab, selectedPollutants, dataType)
  );

  // Reset column selection when dialog opens with new default columns
  React.useEffect(() => {
    if (isOpen) {
      setSelectedColumnKeys(prev =>
        areArraysEqual(prev, defaultColumnKeys) ? prev : defaultColumnKeys
      );
    }
  }, [defaultColumnKeys, isOpen]);

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
    () => getDownloadColumnGroups(activeTab, selectedPollutants, dataType),
    [activeTab, dataType, selectedPollutants]
  );

  const columnLabelMap = useMemo(
    () => getDownloadColumnLabelMap(activeTab, selectedPollutants, dataType),
    [activeTab, dataType, selectedPollutants]
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

  const handleColumnToggle = useCallback((key: string, checked: boolean) => {
    setSelectedColumnKeys(prev => {
      if (checked) {
        return prev.includes(key) ? prev : [...prev, key];
      }

      return prev.filter(columnKey => columnKey !== key);
    });
  }, []);

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

    return previewRows.map(row => {
      const filteredRow: PreviewData = {};

      selectedColumnKeys.forEach(key => {
        filteredRow[key] = row[key] ?? '';
      });

      return filteredRow;
    });
  }, [previewRows, selectedColumnKeys]);

  const hasNoData =
    !isFetchingPreview &&
    !previewError &&
    previewRows.length === 0 &&
    selectedColumnKeys.length > 0;

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Export Preview"
      subtitle="Choose the columns you want to keep before downloading."
      size="2xl"
      className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl"
      maxHeight="max-h-[90vh] sm:max-h-[85vh]"
      primaryAction={{
        label: isDownloading
          ? 'Downloading...'
          : hasNoData
            ? 'Download Metadata Only'
            : 'Confirm & Download',
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
        {/* Data Preview — at top so loading/empty/error states are immediately visible */}
        <div>
          <h3 className="text-sm text-gray-900 dark:text-gray-100 mb-3">
            Data Preview
          </h3>

          {isFetchingPreview ? (
            <div
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden p-8 text-center"
              role="status"
              aria-live="polite"
            >
              <div
                aria-hidden="true"
                className="animate-spin motion-reduce:animate-none rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"
              ></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fetching data preview...
              </p>
            </div>
          ) : previewError ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-3">
                <AqAlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Unable to Load Preview
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
                {previewError}
              </p>
              <Button
                variant="outlined"
                size="sm"
                onClick={onRetryPreview}
              >
                Retry
              </Button>
            </div>
          ) : previewData.length > 0 ? (
            <>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="max-h-80 overflow-auto">
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
                                ? Number.isInteger(row[column.key])
                                  ? String(row[column.key])
                                  : Number(row[column.key]).toFixed(2)
                                : String(row[column.key] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {partialDataWarning && (
                <div className="mt-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AqAlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Partial Data Available
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        {partialDataWarning.withData} of {partialDataWarning.totalSelected} selected {locationType.toLowerCase()} have data.
                        {partialDataWarning.missingNames.length > 0 && (
                          <>
                            {' '}No readings found for:{' '}
                            {partialDataWarning.missingNames.slice(0, 3).join(', ')}
                            {partialDataWarning.missingNames.length > 3 &&
                              ` and ${partialDataWarning.missingNames.length - 3} more`}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Your download will include metadata for all locations, but only those with data will have measurement values.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : hasNoData ? (
            <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-5 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 mb-3">
                <AqSearchMd className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                No Measurement Data Found
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-3">
                There are no readings available for the selected time period,
                locations, and pollutants. Cancel this dialog to adjust your
                filters, then run the export again.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5">
                <span className="text-amber-700 dark:text-amber-300 text-xs font-medium">
                  If you proceed, you will receive a metadata-only file (location
                  names, coordinates, and device info) with no measurement
                  values.
                </span>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden p-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No preview data available.
              </p>
            </div>
          )}
        </div>

        {/* Info banner */}
        <InfoBanner
          dense
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                No columns selected
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Enable at least one column above to continue. Without columns, the download button will remain disabled.
              </p>
            </div>
          )}
        </div>

        {/* What You Will Download - Summary before confirmation */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            What You Will Download
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-blue-600 dark:text-blue-400">Locations:</span>
              <p className="text-blue-900 dark:text-blue-100 font-medium">{selectedLocations.length}</p>
            </div>
            <div>
              <span className="text-blue-600 dark:text-blue-400">With data:</span>
              <p className="text-blue-900 dark:text-blue-100 font-medium">
                {partialDataWarning ? partialDataWarning.withData : selectedLocations.length}
              </p>
            </div>
            <div>
              <span className="text-blue-600 dark:text-blue-400">Without data:</span>
              <p className="text-blue-900 dark:text-blue-100 font-medium">
                {partialDataWarning ? partialDataWarning.totalSelected - partialDataWarning.withData : 0}
              </p>
            </div>
            <div>
              <span className="text-blue-600 dark:text-blue-400">Columns:</span>
              <p className="text-blue-900 dark:text-blue-100 font-medium">{selectedColumnKeys.length}</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            {hasNoData
              ? 'Download includes location metadata only (names, coordinates, device info).'
              : 'Preview shows first 5 rows. Full download includes all matching data.'}
          </p>
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

        {/* Export Notes */}
        <InfoBanner
          dense
          message="Preview shows the first 5 rows of your export. Your download will include all matching data with only the columns selected above."
        />
      </div>
    </ReusableDialog>
  );
};
