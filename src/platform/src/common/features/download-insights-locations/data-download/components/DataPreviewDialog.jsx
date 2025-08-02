import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import ReusableDialog from '@/common/components/Modal/ReusableDialog';
import Button from '@/common/components/Button';
import LoadingSpinner from '@/common/components/LoadingSpinner';
import {
  AqEye,
  AqDownload02,
  AqTable,
  AqGlobe05,
  AqMarkerPin01,
  AqMonitor03,
  AqCheckCircle,
  AqCircle,
  AqInfoCircle,
} from '@airqo/icons-react';
import { AVAILABLE_COLUMNS } from '../hooks/useDataPreview';

const DataPreviewDialog = ({
  isOpen,
  onClose,
  previewData,
  previewLoading,
  previewError,
  selectedColumns,
  onToggleColumn,
  onResetColumns,
  onConfirmDownload,
  downloadLoading,
}) => {
  // Get filtered data based on selected columns
  const filteredData = useMemo(() => {
    if (!previewData) return null;

    const enabledColumns = Object.keys(selectedColumns).filter(
      (key) => selectedColumns[key],
    );
    const filteredHeaders = previewData.headers.filter((header) =>
      enabledColumns.includes(header),
    );
    const filteredRows = previewData.rows.map((row) => {
      const filteredRow = {};
      filteredHeaders.forEach((header) => {
        filteredRow[header] = row[header];
      });
      return filteredRow;
    });

    return {
      ...previewData,
      headers: filteredHeaders,
      rows: filteredRows,
    };
  }, [previewData, selectedColumns]);

  // Get icon for selection type
  const getSelectionIcon = (type) => {
    const iconMap = {
      countries: AqGlobe05,
      cities: AqGlobe05,
      sites: AqMarkerPin01,
      devices: AqMonitor03,
    };
    return iconMap[type] || AqTable;
  };

  // Get the proper item label based on type
  const getItemLabel = (type, count) => {
    if (type === 'countries' || type === 'cities') {
      return `${count} site${count !== 1 ? 's' : ''}`;
    }
    return `${count} ${type}`;
  };

  // Format date consistently
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  // Render loading state
  if (previewLoading) {
    return (
      <ReusableDialog
        isOpen={isOpen}
        onClose={onClose}
        title="Generating Preview..."
        size="md"
        showFooter={false}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner
            useDefaultLoader={false}
            size={32}
            text="Preparing your data preview..."
          />
        </div>
      </ReusableDialog>
    );
  }

  // Render error state
  if (previewError) {
    return (
      <ReusableDialog
        isOpen={isOpen}
        onClose={onClose}
        title="Unable to Generate Preview"
        size="md"
        icon={AqInfoCircle}
        iconColor="text-red-500"
        iconBgColor="bg-red-50 dark:bg-red-900/20"
        primaryAction={{
          label: 'Try Again',
          onClick: onClose,
          variant: 'filled',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: onClose,
          variant: 'outlined',
        }}
      >
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            We couldn&apos;t fetch data for the selected criteria. Please try
            again later.
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            {previewError}
          </p>
        </div>
      </ReusableDialog>
    );
  }

  // Main preview dialog
  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Data Preview"
      subtitle="Review and customize your download"
      size="7xl"
      icon={AqEye}
      iconColor="text-blue-500"
      iconBgColor="bg-blue-50 dark:bg-blue-900/20"
      contentClassName="max-h-[70vh] overflow-hidden"
      showFooter={true}
      customFooter={
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={downloadLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            onClick={onConfirmDownload}
            disabled={downloadLoading || !filteredData?.headers?.length}
            Icon={downloadLoading ? undefined : AqDownload02}
            className="w-full sm:w-auto"
          >
            {downloadLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Downloading...
              </div>
            ) : (
              'Download Data'
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Selection Summary */}
        {previewData?.selectedItemsInfo && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              {React.createElement(
                getSelectionIcon(previewData.selectedItemsInfo.type),
                {
                  size: 20,
                  className: 'mr-2',
                },
              )}
              Selection Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                  Type
                </span>
                <span className="font-medium capitalize">
                  {previewData.selectedItemsInfo.type}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                  Items
                </span>
                <span className="font-medium">
                  {getItemLabel(
                    previewData.selectedItemsInfo.type,
                    previewData.selectedItemsInfo.count,
                  )}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                  Date Range
                </span>
                <span className="font-medium">
                  {formatDate(previewData.dateRange?.start)} -{' '}
                  {formatDate(previewData.dateRange?.end)}
                </span>
              </div>
            </div>

            {/* Special note for countries/cities */}
            {(previewData.selectedItemsInfo.type === 'countries' ||
              previewData.selectedItemsInfo.type === 'cities') && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <AqInfoCircle size={16} className="inline mr-1" />
                  You are downloading data from all monitoring sites within the
                  selected{' '}
                  {previewData.selectedItemsInfo.type === 'countries'
                    ? 'country'
                    : 'city'}
                  . This includes {previewData.selectedItemsInfo.count} sites.
                </p>
              </div>
            )}

            {previewData.previewNote && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <AqInfoCircle size={16} className="inline mr-1" />
                  {previewData.previewNote}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Column Selection */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Select Columns to Include
              </h4>
              <Button
                variant="outlined"
                onClick={onResetColumns}
                className="text-xs self-start sm:self-auto"
              >
                Reset to Default
              </Button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {AVAILABLE_COLUMNS.map((column) => {
                const isAvailable = previewData?.headers?.includes(column.key);
                const isSelected = selectedColumns[column.key];
                const isDisabled = !isAvailable || column.required;

                return (
                  <motion.button
                    key={column.key}
                    onClick={() => !isDisabled && onToggleColumn(column.key)}
                    disabled={isDisabled}
                    className={`
                      flex items-center p-3 rounded-lg border text-left transition-all
                      ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                      ${
                        isDisabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      }
                    `}
                    whileHover={!isDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isDisabled ? { scale: 0.98 } : {}}
                  >
                    {isSelected ? (
                      <AqCheckCircle size={16} className="mr-2 flex-shrink-0" />
                    ) : (
                      <AqCircle size={16} className="mr-2 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {column.label}
                      </div>
                      {column.required && (
                        <div className="text-xs text-gray-500">Required</div>
                      )}
                      {!isAvailable && (
                        <div className="text-xs text-red-500">
                          Not available
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Data Preview Table */}
        {filteredData && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Data Preview ({filteredData.rows?.length || 0} rows shown)
              </h4>
            </div>

            <div className="overflow-auto max-h-96">
              {filteredData.headers?.length > 0 ? (
                <div className="min-w-full">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                      <tr>
                        {filteredData.headers?.map((header) => (
                          <th
                            key={header}
                            className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 min-w-[120px]"
                          >
                            {AVAILABLE_COLUMNS.find((col) => col.key === header)
                              ?.label || header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.rows?.map((row, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          {filteredData.headers?.map((header) => {
                            let cellValue = row[header];

                            // Format datetime values
                            if (header === 'datetime' && cellValue) {
                              try {
                                cellValue = format(
                                  new Date(cellValue),
                                  'MMM d, yyyy HH:mm',
                                );
                              } catch {
                                // Keep original value if parsing fails
                              }
                            }

                            return (
                              <td
                                key={`${index}-${header}`}
                                className="px-4 py-3 text-gray-900 dark:text-white"
                              >
                                {cellValue !== null &&
                                cellValue !== undefined &&
                                cellValue !== ''
                                  ? String(cellValue)
                                  : '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No columns selected for preview
                </div>
              )}

              {filteredData.headers?.length > 0 &&
                (!filteredData.rows || filteredData.rows.length === 0) && (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No data available for the selected date range
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </ReusableDialog>
  );
};

DataPreviewDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  previewData: PropTypes.object,
  previewLoading: PropTypes.bool,
  previewError: PropTypes.string,
  selectedColumns: PropTypes.object,
  onToggleColumn: PropTypes.func.isRequired,
  onResetColumns: PropTypes.func.isRequired,
  onConfirmDownload: PropTypes.func.isRequired,
  downloadLoading: PropTypes.bool,
};

DataPreviewDialog.defaultProps = {
  previewData: null,
  previewLoading: false,
  previewError: null,
  selectedColumns: {},
  downloadLoading: false,
};

export default DataPreviewDialog;
