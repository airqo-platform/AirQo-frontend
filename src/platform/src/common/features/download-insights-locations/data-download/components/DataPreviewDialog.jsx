import React, { useMemo, useCallback } from 'react';
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

// Memoized icon mapping to prevent recreation
const SELECTION_ICONS = {
  countries: AqGlobe05,
  cities: AqGlobe05,
  sites: AqMarkerPin01,
  devices: AqMonitor03,
};

// Memoized date formatter with error handling
const formatDateSafe = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
};

// Memoized datetime formatter
const formatDateTimeSafe = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? dateString
      : format(date, 'MMM d, yyyy HH:mm');
  } catch {
    return dateString;
  }
};

// Memoized column button component
const ColumnButton = React.memo(
  ({ column, isSelected, isAvailable, onToggle }) => {
    const isDisabled = !isAvailable || column.required;

    const handleClick = useCallback(() => {
      if (!isDisabled) {
        onToggle(column.key);
      }
    }, [isDisabled, onToggle, column.key]);

    return (
      <motion.button
        onClick={handleClick}
        disabled={isDisabled}
        className={`
        flex items-center px-3 py-2 rounded-lg border text-left transition-all w-full
        ${
          isSelected
            ? 'bg-primary/10 border-primary text-primary'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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
          <div className="text-sm font-medium truncate">{column.label}</div>
          {column.required && (
            <div className="text-xs text-gray-500">Required</div>
          )}
          {!isAvailable && (
            <div className="text-xs text-red-500">Not available</div>
          )}
        </div>
      </motion.button>
    );
  },
);

ColumnButton.displayName = 'ColumnButton';

// Memoized selection summary component
const SelectionSummary = React.memo(({ selectedItemsInfo, dateRange }) => {
  const Icon = SELECTION_ICONS[selectedItemsInfo?.type] || AqTable;

  const getItemLabel = useCallback((type, count) => {
    if (type === 'countries' || type === 'cities') {
      return `${count} site${count !== 1 ? 's' : ''}`;
    }
    return `${count} ${type}`;
  }, []);

  if (!selectedItemsInfo) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
        <Icon size={20} className="mr-2" />
        Selection Summary
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
            Type
          </span>
          <span className="font-medium capitalize">
            {selectedItemsInfo.type}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
            Items
          </span>
          <span className="font-medium">
            {getItemLabel(selectedItemsInfo.type, selectedItemsInfo.count)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
            Date Range
          </span>
          <span className="font-medium">
            {formatDateSafe(dateRange?.start)} -{' '}
            {formatDateSafe(dateRange?.end)}
          </span>
        </div>
      </div>
    </div>
  );
});

SelectionSummary.displayName = 'SelectionSummary';

// Memoized info alerts component
const InfoAlerts = React.memo(({ selectedItemsInfo, previewNote }) => {
  if (!selectedItemsInfo && !previewNote) return null;

  return (
    <div className="space-y-3">
      {(selectedItemsInfo?.type === 'countries' ||
        selectedItemsInfo?.type === 'cities') && (
        <div className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <AqInfoCircle
            size={16}
            className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0"
          />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            You are downloading data from all monitoring sites within the
            selected{' '}
            {selectedItemsInfo.type === 'countries' ? 'country' : 'city'}. This
            includes {selectedItemsInfo.count} sites.
          </p>
        </div>
      )}

      {previewNote && (
        <div className="flex items-start p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AqInfoCircle
            size={16}
            className="text-amber-600 dark:text-amber-400 mr-2 mt-0.5 flex-shrink-0"
          />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {previewNote}
          </p>
        </div>
      )}
    </div>
  );
});

InfoAlerts.displayName = 'InfoAlerts';

// Memoized table row component
const TableRow = React.memo(({ row, headers, index }) => (
  <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
    {headers.map((header) => {
      let cellValue = row[header];

      // Format datetime values
      if (header === 'datetime' && cellValue) {
        cellValue = formatDateTimeSafe(cellValue);
      }

      const displayValue =
        cellValue !== null && cellValue !== undefined && cellValue !== ''
          ? String(cellValue)
          : '-';

      return (
        <td
          key={`${index}-${header}`}
          className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap"
        >
          {displayValue}
        </td>
      );
    })}
  </tr>
));

TableRow.displayName = 'TableRow';

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
  // Memoized filtered data to prevent unnecessary recalculations
  const filteredData = useMemo(() => {
    if (!previewData) return null;

    const enabledColumns = Object.keys(selectedColumns).filter(
      (key) => selectedColumns[key],
    );
    if (enabledColumns.length === 0)
      return { ...previewData, headers: [], rows: [] };

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

  // Memoized column info with availability check
  const columnInfo = useMemo(() => {
    return AVAILABLE_COLUMNS.map((column) => ({
      ...column,
      isAvailable: previewData?.headers?.includes(column.key) ?? false,
      isSelected: selectedColumns[column.key] ?? false,
    }));
  }, [previewData?.headers, selectedColumns]);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleToggleColumn = useCallback(
    (columnKey) => {
      onToggleColumn(columnKey);
    },
    [onToggleColumn],
  );

  const handleResetColumns = useCallback(() => {
    onResetColumns();
  }, [onResetColumns]);

  const handleConfirmDownload = useCallback(() => {
    onConfirmDownload();
  }, [onConfirmDownload]);

  // Loading state
  if (previewLoading) {
    return (
      <ReusableDialog
        isOpen={isOpen}
        onClose={onClose}
        title="Generating Preview..."
        size="md"
        showFooter={false}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner
            useDefaultLoader={false}
            size={32}
            text="Preparing your data preview..."
          />
        </div>
      </ReusableDialog>
    );
  }

  // Error state
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
        <div className="text-center py-6">
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            We couldn&apos;t fetch data for the selected criteria. Please try
            again later.
          </p>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300 font-mono">
              {previewError}
            </p>
          </div>
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
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/30">
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
            onClick={handleConfirmDownload}
            disabled={downloadLoading || !filteredData?.headers?.length}
            Icon={downloadLoading ? undefined : AqDownload02}
            className="w-full sm:w-auto shadow-lg"
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
      <div className="space-y-6 p-1">
        {/* Selection Summary */}
        <SelectionSummary
          selectedItemsInfo={previewData?.selectedItemsInfo}
          dateRange={previewData?.dateRange}
        />

        {/* Info Alerts */}
        <InfoAlerts
          selectedItemsInfo={previewData?.selectedItemsInfo}
          previewNote={previewData?.previewNote}
        />

        {/* Column Selection */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Select Columns to Include
              </h4>
              <Button
                variant="outlined"
                onClick={handleResetColumns}
                className="text-xs self-start sm:self-auto"
              >
                Reset to Default
              </Button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {columnInfo.map((column) => (
                <ColumnButton
                  key={column.key}
                  column={column}
                  isSelected={column.isSelected}
                  isAvailable={column.isAvailable}
                  onToggle={handleToggleColumn}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Data Preview Table */}
        {filteredData && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/30 px-4 py-3 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Data Preview ({filteredData.rows?.length || 0} rows shown)
              </h4>
            </div>

            <div className="overflow-auto max-h-80">
              {filteredData.headers?.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700/50 sticky top-0 z-10">
                    <tr>
                      {filteredData.headers.map((header) => {
                        const column = AVAILABLE_COLUMNS.find(
                          (col) => col.key === header,
                        );
                        return (
                          <th
                            key={header}
                            className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 min-w-[120px] text-xs uppercase tracking-wider"
                          >
                            {column?.label || header}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.rows?.map((row, index) => (
                      <TableRow
                        key={index}
                        row={row}
                        headers={filteredData.headers}
                        index={index}
                      />
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                  <AqTable size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No columns selected for preview</p>
                </div>
              )}

              {filteredData.headers?.length > 0 &&
                (!filteredData.rows || filteredData.rows.length === 0) && (
                  <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                    <AqInfoCircle
                      size={32}
                      className="mx-auto mb-3 opacity-50"
                    />
                    <p className="text-sm">
                      No data available for the selected date range
                    </p>
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
