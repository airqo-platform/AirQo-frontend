import React, { useMemo } from 'react';
import { Button } from '@/shared/components/ui';
import { Input } from '@/shared/components/ui/input';
import Checkbox from '@/shared/components/ui/checkbox';
import { CustomField } from './CustomField';
import { DateRange } from '@/shared/components/calendar/types';
import { WarningBanner } from '@/shared/components/ui';
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
  { value: 'lowcost', label: 'Low Cost' },
  { value: 'bam', label: 'BAM' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'gas', label: 'Gas' },
];

const pollutants = Object.keys(POLLUTANT_LABELS);

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
}) => {
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
  return (
    <>
      {/* Sidebar - Hidden by default, shown when toggled */}
      <aside
        className={`fixed lg:static top-0 left-0 z-[60] w-80 lg:w-64 h-full lg:h-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto flex-col shadow-lg lg:shadow-sm transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarOpen ? 'flex' : 'hidden'}`}
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Export Configuration
          </h2>

          {/* File Title Input - First */}
          <Input
            type="text"
            placeholder="Enter file title"
            value={fileTitle}
            onChange={e => setFileTitle(e.target.value)}
            className="w-full"
          />

          {/* Device Category */}
          <CustomField
            label="Device Category"
            value={deviceCategory}
            onChange={setDeviceCategory}
            options={deviceCategoryOptions}
            placeholder="Select device category"
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
          <WarningBanner
            title="Download Limit Notice"
            message="Annual data downloads must be done in batches. Please select shorter date ranges for optimal performance."
          />

          {/* Data Type */}
          <CustomField
            label="Data Type"
            value={dataType}
            onChange={setDataType}
            options={dataTypeOptions}
            placeholder="Select data type"
          />

          {/* Pollutants */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pollutants
            </label>
            <div className="space-y-2">
              {pollutants.map(pollutant => (
                <div key={pollutant} className="flex items-center">
                  <Checkbox
                    id={pollutant}
                    checked={selectedPollutants.includes(pollutant)}
                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                      if (checked === true) {
                        setSelectedPollutants(prev => [...prev, pollutant]);
                      } else if (checked === false) {
                        setSelectedPollutants(prev =>
                          prev.filter(p => p !== pollutant)
                        );
                      }
                    }}
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
          <CustomField
            label="Frequency"
            value={frequency}
            onChange={setFrequency}
            options={frequencyOptions}
            placeholder="Select frequency"
          />
        </div>
      </aside>

      {/* Mobile Sidebar - Within Content Area */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-[60] w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
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
            <Input
              type="text"
              placeholder="Enter file title"
              value={fileTitle}
              onChange={e => setFileTitle(e.target.value)}
              className="w-full"
            />

            {/* Device Category */}
            <CustomField
              label="Device Category"
              value={deviceCategory}
              onChange={setDeviceCategory}
              options={deviceCategoryOptions}
              placeholder="Select device category"
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
            <WarningBanner
              title="Download Limit Notice"
              message="Annual data downloads must be done in batches. Please select shorter date ranges for optimal performance."
            />

            {/* Data Type */}
            <CustomField
              label="Data Type"
              value={dataType}
              onChange={setDataType}
              options={dataTypeOptions}
              placeholder="Select data type"
            />

            {/* Pollutants */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pollutants
              </label>
              <div className="space-y-2">
                {pollutants.map(pollutant => (
                  <div key={pollutant} className="flex items-center">
                    <Checkbox
                      id={pollutant}
                      checked={selectedPollutants.includes(pollutant)}
                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                        if (checked === true) {
                          setSelectedPollutants(prev => [...prev, pollutant]);
                        } else if (checked === false) {
                          setSelectedPollutants(prev =>
                            prev.filter(p => p !== pollutant)
                          );
                        }
                      }}
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
            <CustomField
              label="Frequency"
              value={frequency}
              onChange={setFrequency}
              options={frequencyOptions}
              placeholder="Select frequency"
            />
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
