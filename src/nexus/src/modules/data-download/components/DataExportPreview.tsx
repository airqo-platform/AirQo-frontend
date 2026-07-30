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
import { Button } from '@/shared/components/ui';
import { buildDataDownloadRequest } from '../utils/dataExportRequest';
import { useDownloadData } from '@/shared/hooks/useAnalytics';
import { DeviceCategory } from '../types/dataExportTypes';
import type { DataDownloadRequest } from '@/shared/types/api';

interface DataExportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedColumnKeys: string[]) => void;
  isDownloading: boolean;

  dataType: string;
  frequency: string;
  fileType: string;
  selectedPollutants: string[];
  dateRange: DateRange | undefined;
  activeTab: 'sites' | 'devices' | 'countries' | 'cities';
  selectedSites: string[];
  selectedDevices: string[];
  selectedDeviceIds: string[];
  selectedGridIds: string[];
  selectedGridSites: Record<string, string[]>;
  selectedGridSiteIds: Record<string, string[]>;
  deviceCategory: DeviceCategory;
}

type PreviewData = Record<string, string | number | null>;

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
  selectedDeviceIds,
  selectedGridIds,
  selectedGridSites,
  selectedGridSiteIds,
  deviceCategory,
}) => {
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(() =>
    getDefaultDownloadColumnKeys(activeTab, selectedPollutants, dataType)
  );
  const previousOpenRef = useRef(false);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { trigger: fetchPreviewData } = useDownloadData();
  const [previewRows, setPreviewRows] = useState<PreviewData[]>([]);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewRequestRef = useRef<DataDownloadRequest | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  const defaultColumnKeys = useMemo(
    () => getDefaultDownloadColumnKeys(activeTab, selectedPollutants, dataType),
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

  const parseCsvLine = useCallback((line: string): string[] => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          fields.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
    }

    fields.push(current.trim());
    return fields;
  }, []);

  const doFetchPreview = useCallback(
    (request: DataDownloadRequest, controller: AbortController) => {
      fetchPreviewData(request)
        .then(response => {
          if (!isMountedRef.current || controller.signal.aborted) return;

          if (typeof response === 'string') {
            const lines = response.split('\n').filter(line => line.trim());
            if (lines.length > 1) {
              const headers = parseCsvLine(lines[0]);
              const rows = lines.slice(1, 6).map(line => {
                const values = parseCsvLine(line);
                const row: PreviewData = {};
                headers.forEach((header, index) => {
                  const val = values[index];
                  if (val === '' || val === undefined) {
                    row[header] = null;
                  } else {
                    const num = Number(val);
                    row[header] = isNaN(num) ? val : num;
                  }
                });
                return row;
              });
              setPreviewRows(rows);
            } else {
              setPreviewRows([]);
            }
          } else if (
            response &&
            typeof response === 'object' &&
            'data' in response &&
            Array.isArray((response as { data: unknown }).data)
          ) {
            const responseData = (
              response as unknown as { data: Record<string, unknown>[] }
            ).data;
            const rows: PreviewData[] = responseData.slice(0, 5).map(item => {
              const row: PreviewData = {};
              Object.entries(item).forEach(([key, value]) => {
                row[key] =
                  typeof value === 'number'
                    ? value
                    : value != null
                      ? String(value)
                      : null;
              });
              return row;
            });
            setPreviewRows(rows);
          } else {
            setPreviewRows([]);
          }
        })
        .catch(() => {
          if (!isMountedRef.current || controller.signal.aborted) return;
          setPreviewError(
            'Unable to load data preview. You can retry or proceed with the download.'
          );
        })
        .finally(() => {
          if (isMountedRef.current && !controller.signal.aborted) {
            setIsFetchingPreview(false);
          }
        });
    },
    [fetchPreviewData, parseCsvLine]
  );

  useEffect(() => {
    if (isOpen && !previousOpenRef.current) {
      setSelectedColumnKeys(prev =>
        areArraysEqual(prev, defaultColumnKeys) ? prev : defaultColumnKeys
      );
      setPreviewRows([]);
      setPreviewError(null);
      setIsFetchingPreview(true);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const effectiveDataType: 'calibrated' | 'raw' =
        activeTab === 'devices' && deviceCategory === 'bam'
          ? 'raw'
          : (dataType as 'calibrated' | 'raw');

      const previewRequest: DataDownloadRequest = buildDataDownloadRequest({
        dateRange,
        activeTab,
        selectedSites,
        selectedDeviceIds,
        selectedDeviceNames: selectedDevices,
        selectedGridIds,
        selectedGridSites,
        selectedGridSiteIds,
        selectedPollutants,
        dataType: effectiveDataType,
        fileType: 'csv',
        frequency,
        deviceCategory,
      });

      previewRequestRef.current = previewRequest;
      doFetchPreview(previewRequest, abortController);
    }

    previousOpenRef.current = isOpen;
  }, [
    defaultColumnKeys,
    isOpen,
    doFetchPreview,
    dataType,
    frequency,
    selectedPollutants,
    dateRange,
    activeTab,
    selectedSites,
    selectedDevices,
    selectedDeviceIds,
    selectedGridIds,
    selectedGridSites,
    selectedGridSiteIds,
    deviceCategory,
  ]);

  const handleRetryPreview = useCallback(() => {
    if (!previewRequestRef.current) return;
    setPreviewError(null);
    setPreviewRows([]);
    setIsFetchingPreview(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    doFetchPreview(previewRequestRef.current, abortController);
  }, [doFetchPreview]);

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
            Data Preview (First 5 Rows)
          </h3>

          {selectedColumnKeys.length === 0 ? (
            <InfoBanner
              title="Preview Unavailable"
              message="Select at least one column above to preview the export output."
            />
          ) : isFetchingPreview ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading data preview...</p>
            </div>
          ) : previewError ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-3">
                <span className="text-amber-600 dark:text-amber-400 text-xl">&#9888;</span>
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
                onClick={handleRetryPreview}
                disabled={isFetchingPreview}
                loading={isFetchingPreview}
              >
                Retry
              </Button>
            </div>
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
          ) : (
            <InfoBanner
              title="No Data Available"
              message="The current filter settings did not return any data. Please try adjusting your date range, locations, or pollutants. The download will still provide metadata for the selected items."
            />
          )}
        </div>

        {/* Export Notes */}
        <InfoBanner
          dense
          message={`Preview shows the first 5 rows of your export. Your download will include all matching data with only the columns selected above.`}
        />
      </div>
    </ReusableDialog>
  );
};
