import React, { useMemo, useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui';
import { Input } from '@/shared/components/ui/input';
import Checkbox from '@/shared/components/ui/checkbox';
import { CustomField } from './CustomField';
import { DateRange } from '@/shared/components/calendar/types';
import { WarningBanner } from '@/shared/components/ui';
import { Tooltip } from 'flowbite-react';
import {
  FREQUENCY_LABELS,
  POLLUTANT_LABELS,
  DATA_TYPE_LABELS,
} from '@/shared/components/charts/constants';

interface DataExportSidebarProps {
  // State
  fileTitle: string;
  setFileTitle: (value: string) => void;
  dataType: string;
  setDataType: (value: string) => void;
  frequency: string;
  setFrequency: (value: string) => void;
  fileType: string;
  setFileType: (value: string) => void;
  selectedPollutants: string[];
  setSelectedPollutants: React.Dispatch<React.SetStateAction<string[]>>;
  dateRange: DateRange | undefined;
  setDateRange: (value: DateRange | undefined) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  deviceCategory: string;
  setDeviceCategory: (value: string) => void;
  activeTab: string; // Add activeTab prop
}

const dataTypeOptions = Object.entries(DATA_TYPE_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  })
);

const fileTypeOptions = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
];

const deviceCategoryOptions = [
  { value: 'lowcost', label: 'Low Cost Sensor' },
  { value: 'bam', label: 'Reference Monitor' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'gas', label: 'Gas' },
];

const pollutants = Object.keys(POLLUTANT_LABELS);

const FieldLabel = ({
  label,
  tooltip,
}: {
  label: string;
  tooltip?: string;
}) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </span>
    {tooltip && (
      <Tooltip content={tooltip} placement="top">
        <span className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-help">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </Tooltip>
    )}
  </span>
);

export const DataExportSidebar: React.FC<DataExportSidebarProps> = ({
  fileTitle,
  setFileTitle,
  dataType,
  setDataType,
  frequency,
  setFrequency,
  fileType,
  setFileType,
  selectedPollutants,
  setSelectedPollutants,
  dateRange,
  setDateRange,
  sidebarOpen,
  setSidebarOpen,
  deviceCategory,
  setDeviceCategory,
  activeTab,
}) => {
  const hideDataTypeSelection =
    activeTab === 'devices' && deviceCategory === 'bam';

  const frequencyOptions = useMemo(() => {
    const allOptions = Object.entries(FREQUENCY_LABELS).map(
      ([value, label]) => ({
        value,
        label,
      })
    );

    if (deviceCategory === 'mobile') {
      return allOptions.filter(option => option.value === 'raw');
    } else {
      return allOptions.filter(option => option.value !== 'raw');
    }
  }, [deviceCategory]);
  const showDownloadLimitNotice = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return false;

    return (
      Math.abs(dateRange.to.getTime() - dateRange.from.getTime()) /
        (1000 * 60 * 60 * 24) >
      90
    );
  }, [dateRange]);
  const [pollutantError, setPollutantError] = useState<string | null>(null);

  const handlePollutantChange = useCallback(
    (pollutant: string, checked: boolean | 'indeterminate') => {
      // Clear previous error on any interaction
      setPollutantError(null);

      if (checked === true) {
        setSelectedPollutants(prev =>
          prev.includes(pollutant) ? prev : [...prev, pollutant]
        );
        return;
      }

      if (checked === false) {
        // Prevent removing the last selected pollutant
        if (selectedPollutants.length <= 1) {
          setPollutantError('Please select at least one pollutant.');
          return;
        }

        setSelectedPollutants(prev => prev.filter(p => p !== pollutant));
      }
    },
    [selectedPollutants, setSelectedPollutants]
  );
  return (
    <>
      {/* Sidebar - Hidden by default on mobile, always visible on desktop */}
      <aside
        className={`hidden lg:flex lg:static top-0 left-0 z-[60] lg:w-64 h-full lg:h-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-visible flex-col shadow-lg lg:shadow-sm transition-all duration-300 ease-in-out`}
      >
        <div className="space-y-4">
          <h2 className="text-lg text-gray-900 dark:text-gray-100">
            Export Configuration
          </h2>

          {/* File Title Input - First */}
          <div className="space-y-1">
            <label
              htmlFor="file-title-desktop"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              File Title
            </label>
            <Input
              id="file-title-desktop"
              type="text"
              placeholder="Enter file title (optional)"
              value={fileTitle}
              onChange={e => setFileTitle(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Device Category */}
          <CustomField
            label="Device Category"
            value={deviceCategory}
            onChange={setDeviceCategory}
            options={deviceCategoryOptions}
            placeholder="Select device category"
            disabled={activeTab !== 'devices'}
          />

          {/* Date Range - Required */}
          <div className="space-y-2">
            <CustomField
              mode="calendar"
              selectedRange={dateRange}
              onRangeSelect={setDateRange}
              label="Date Range"
              value=""
              required
              onChange={() => {}}
              options={[]}
            />
            {!dateRange?.from && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Date range is required for data export
              </p>
            )}
          </div>

          {/* Download Limit Notice — only show for large date ranges */}
          {showDownloadLimitNotice && (
            <WarningBanner
              title="Download Limit Notice"
              message="Annual data downloads must be done in batches. Please select shorter date ranges for optimal performance."
            />
          )}

          {/* Data Type */}
          {!hideDataTypeSelection && (
            <div className="space-y-2">
              <FieldLabel
                label="Data Type"
                tooltip="Calibrated data is quality-assured and adjusted for sensor drift. Raw data is unprocessed sensor output."
              />
              <CustomField
                label="Data Type"
                value={dataType}
                onChange={setDataType}
                options={dataTypeOptions}
                placeholder="Select data type"
                showLabel={false}
              />
            </div>
          )}

          {/* Pollutants */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pollutants
            </label>
            {pollutantError && (
              <p
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
                aria-live="polite"
              >
                {pollutantError}
              </p>
            )}
            <div className="space-y-2">
              {pollutants.map(pollutant => (
                <div key={pollutant} className="flex items-center">
                  <Checkbox
                    id={pollutant}
                    checked={selectedPollutants.includes(pollutant)}
                    onCheckedChange={(checked: boolean | 'indeterminate') =>
                      handlePollutantChange(pollutant, checked)
                    }
                  />
                  <label htmlFor={pollutant} className="ml-2 text-sm">
                    {
                      POLLUTANT_LABELS[
                        pollutant as keyof typeof POLLUTANT_LABELS
                      ]
                    }
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* File Type */}
          <CustomField
            label="File Type"
            value={fileType}
            onChange={setFileType}
            options={fileTypeOptions}
            placeholder="Select file type"
          />

          {/* Frequency */}
          <div className="space-y-2">
            <FieldLabel
              label="Frequency"
              tooltip="How the data is aggregated over time. Hourly gives per-hour readings, Daily averages once per day, Monthly averages once per month."
            />
            <CustomField
              label="Frequency"
              value={frequency}
              onChange={setFrequency}
              options={frequencyOptions}
              placeholder="Select frequency"
              showLabel={false}
            />
          </div>
        </div>
      </aside>

      {/* Mobile/Tablet Sidebar - Below lg breakpoint */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-[60] w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out motion-reduce:transition-none overflow-visible ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarOpen ? 'flex' : 'hidden'}`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg text-gray-900 dark:text-gray-100">
              Export Configuration
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="p-2"
            >
              ✕
            </Button>
          </div>

          {/* Mobile Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* File Title Input - First */}
            <div className="space-y-1">
              <label
                htmlFor="file-title-mobile"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                File Title
              </label>
              <Input
                id="file-title-mobile"
                type="text"
                placeholder="Enter file title (optional)"
                value={fileTitle}
                onChange={e => setFileTitle(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Device Category */}
            <CustomField
              label="Device Category"
              value={deviceCategory}
              onChange={setDeviceCategory}
              options={deviceCategoryOptions}
              placeholder="Select device category"
              disabled={activeTab !== 'devices'}
            />

            {/* Date Range - Required */}
            <div className="space-y-2">
              <CustomField
                mode="calendar"
                selectedRange={dateRange}
                onRangeSelect={setDateRange}
                label="Date Range"
                value=""
                required
                onChange={() => {}}
                options={[]}
              />
              {!dateRange?.from && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Date range is required for data export
                </p>
              )}
            </div>

            {/* Download Limit Notice */}
            {showDownloadLimitNotice && (
              <WarningBanner
                title="Download Limit Notice"
                message="Annual data downloads must be done in batches. Please select shorter date ranges for optimal performance."
              />
            )}

            {/* Data Type */}
            {!hideDataTypeSelection && (
              <div className="space-y-2">
                <FieldLabel
                  label="Data Type"
                  tooltip="Calibrated data is quality-assured and adjusted for sensor drift. Raw data is unprocessed sensor output."
                />
                <CustomField
                  label="Data Type"
                  value={dataType}
                  onChange={setDataType}
                  options={dataTypeOptions}
                  placeholder="Select data type"
                  showLabel={false}
                />
              </div>
            )}

            {/* Pollutants */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pollutants
              </label>
              {pollutantError && (
                <p
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                  aria-live="polite"
                >
                  {pollutantError}
                </p>
              )}
              <div className="space-y-2">
                {pollutants.map(pollutant => (
                  <div key={pollutant} className="flex items-center">
                    <Checkbox
                      id={pollutant}
                      checked={selectedPollutants.includes(pollutant)}
                      onCheckedChange={(checked: boolean | 'indeterminate') =>
                        handlePollutantChange(pollutant, checked)
                      }
                    />
                    <label htmlFor={pollutant} className="ml-2 text-sm">
                      {
                        POLLUTANT_LABELS[
                          pollutant as keyof typeof POLLUTANT_LABELS
                        ]
                      }
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* File Type */}
            <CustomField
              label="File Type"
              value={fileType}
              onChange={setFileType}
              options={fileTypeOptions}
              placeholder="Select file type"
            />

            {/* Frequency */}
            <div className="space-y-2">
              <FieldLabel
                label="Frequency"
                tooltip="How the data is aggregated over time. Hourly gives per-hour readings, Daily averages once per day, Monthly averages once per month."
              />
              <CustomField
                label="Frequency"
                value={frequency}
                onChange={setFrequency}
                options={frequencyOptions}
                placeholder="Select frequency"
                showLabel={false}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile/Tablet Sidebar Overlay - Only when open on smaller screens */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[55] bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};
