import React, { useCallback, useMemo, useState } from 'react';
import Checkbox from '@/shared/components/ui/checkbox';
import { Button } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import ReusableDialog from '@/shared/components/ui/dialog';
import { DateRange } from '@/shared/components/calendar/types';
import {
  FREQUENCY_LABELS,
  DATA_TYPE_LABELS,
} from '@/shared/components/charts/constants';
import { WarningBanner, InfoBanner } from '@/shared/components/ui/banner';
import { areArraysEqual } from '@/shared/utils/arrays';
import {
  AqAlertTriangle,
  AqLoading02,
  AqSettings01,
} from '@airqo/icons-react';
import {
  getDefaultDownloadColumnKeys,
  getDownloadColumnGroups,
  getDownloadColumnLabelMap,
} from '../utils/dataExportFile';
import { resolveGridSitesForDownload } from '../utils/dataExportRequest';

type PreviewData = Record<string, string | number | null>;

interface DataExportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedColumnKeys: string[]) => void;
  onRetryPreview: () => void;
  isDownloading: boolean;

  // Preview data built from cached data (no API call)
  previewRows: PreviewData[];
  isFetchingPreview: boolean;
  previewError: string | null;

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

export const DataExportPreview: React.FC<DataExportPreviewProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onRetryPreview,
  isDownloading,
  previewRows,
  isFetchingPreview,
  previewError,
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

  const columnOptionCount = useMemo(
    () =>
      columnGroups.reduce((count, group) => count + group.options.length, 0),
    [columnGroups]
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
      case 'cities':
        return resolveGridSitesForDownload(
          selectedGridIds,
          selectedGridSites,
          selectedGridSiteIds
        );
      default:
        return [];
    }
  }, [
    activeTab,
    selectedSites,
    selectedDevices,
    selectedGridIds,
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
      subtitle={`Review the ${selectedLocations.length} selected ${locationType.toLowerCase()} below. Choose the columns you want to keep before downloading.`}
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
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm text-gray-900 dark:text-gray-100">
              Data Preview
            </h3>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outlined"
                  size="sm"
                  Icon={AqSettings01}
                  iconPosition="start"
                  aria-label={`Configure columns, ${selectedColumnKeys.length} of ${columnOptionCount} selected`}
                  className="shrink-0"
                >
                  <span>Configure columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="z-[10002] max-h-[min(70vh,32rem)] w-80 overflow-y-auto p-2"
              >
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Configure columns
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {selectedColumnKeys.length} of {columnOptionCount} selected
                  </p>
                </div>
                <DropdownMenuSeparator />

                {columnGroups.map(group => (
                  <fieldset key={group.id} className="px-2 py-2">
                    <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {group.title}
                    </legend>
                    <div className="space-y-1">
                      {group.options.map(option => (
                        <Checkbox
                          key={option.key}
                          checked={selectedColumnKeys.includes(option.key)}
                          onCheckedChange={checked =>
                            handleColumnToggle(option.key, checked === true)
                          }
                          label={
                            <span className="leading-5 text-gray-900 dark:text-gray-100">
                              {option.label}
                            </span>
                          }
                          aria-label={option.label}
                          className="w-full rounded-md px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        />
                      ))}
                    </div>
                  </fieldset>
                ))}

                {selectedColumnKeys.length === 0 && (
                  <p className="mx-2 mb-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                    Select at least one column to enable download.
                  </p>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isFetchingPreview ? (
            <div
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden p-8 text-center"
              role="status"
              aria-live="polite"
            >
              <div aria-hidden="true" className="flex justify-center mb-4">
                <AqLoading02 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Building preview...
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
              <Button variant="outlined" size="sm" onClick={onRetryPreview}>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Showing metadata for all {selectedLocations.length} selected {locationType.toLowerCase()}. The actual download will include measurement data for these locations based on your export configuration.
              </p>
            </>
          ) : hasNoData ? (
            <WarningBanner
              dense
              title="No Measurement Data Found"
              message="There are no readings available for the selected time period, locations, and pollutants. If you proceed, you will receive a metadata-only file (location names, coordinates, and device info) with no measurement values."
            />
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden p-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No preview data available.
              </p>
            </div>
          )}
        </div>

        {/* Warning banner about potentially missing data */}
        <WarningBanner
          dense
          title="Data May Be Incomplete"
          message="The data you download may contain missing values or no data at all. If no data is available for your selected filters, you will download the metadata for the selected locations only."
        />

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
          message="This preview shows a summary of your selected locations. Your download will include all measurement data matching your export configuration with only the columns selected above."
        />
      </div>
    </ReusableDialog>
  );
};
