import React, { useMemo, useCallback } from 'react';
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
  AqInfoCircle,
} from '@airqo/icons-react';
import SelectionMessage from '../../components/SelectionMessage';
import { AVAILABLE_COLUMNS } from '../hooks/useDataPreview';

/* -----------------------------
   Safe Date Formatters
----------------------------- */
const formatDateSafe = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : format(d, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
};

const formatDateTimeSafe = (dateString) => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : format(d, 'MMM d, yyyy HH:mm');
  } catch {
    return dateString;
  }
};

/* -----------------------------
   Selection Summary
----------------------------- */
const SELECTION_ICONS = {
  countries: AqGlobe05,
  cities: AqGlobe05,
  sites: AqMarkerPin01,
  devices: AqMonitor03,
};

const SelectionSummary = React.memo(({ selectedItemsInfo, dateRange }) => {
  if (!selectedItemsInfo) return null;
  const Icon = SELECTION_ICONS[selectedItemsInfo?.type] || AqTable;

  return (
    <div className="border rounded-md bg-white dark:bg-gray-800 p-3">
      <h4 className="font-medium flex items-center text-gray-900 dark:text-white mb-3">
        <Icon size={16} className="mr-2" /> Selection Summary
      </h4>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <span className="block text-xs text-gray-500 uppercase">Type</span>
          <span className="font-medium capitalize">
            {selectedItemsInfo.type}
          </span>
        </div>
        <div>
          <span className="block text-xs text-gray-500 uppercase">Items</span>
          <span className="font-medium">{selectedItemsInfo.count}</span>
        </div>
        <div>
          <span className="block text-xs text-gray-500 uppercase">
            Date Range
          </span>
          <span className="font-medium">
            {formatDateSafe(dateRange?.start)} –{' '}
            {formatDateSafe(dateRange?.end)}
          </span>
        </div>
      </div>
    </div>
  );
});
SelectionSummary.displayName = 'SelectionSummary';

/* -----------------------------
   Table Row
----------------------------- */
const TableRow = React.memo(({ row, headers, index }) => (
  <tr className="border-b last:border-none border-gray-200 dark:border-gray-700">
    {headers.map((header) => {
      let cellValue = row[header];
      if (header === 'datetime' && cellValue)
        cellValue = formatDateTimeSafe(cellValue);
      const display =
        cellValue !== null && cellValue !== undefined && cellValue !== ''
          ? String(cellValue)
          : '-';
      return (
        <td
          key={`${index}-${header}`}
          className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap"
        >
          {display}
        </td>
      );
    })}
  </tr>
));
TableRow.displayName = 'TableRow';

/* -----------------------------
   Main Dialog
----------------------------- */
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
  /* Prepare filtered preview data */
  const filteredData = useMemo(() => {
    if (!previewData) return null;
    const enabled = Object.keys(selectedColumns).filter(
      (k) => selectedColumns[k],
    );
    if (enabled.length === 0) return { ...previewData, headers: [], rows: [] };
    const headers = previewData.headers.filter((h) => enabled.includes(h));
    const rows = previewData.rows.map((r) =>
      headers.reduce((acc, h) => ({ ...acc, [h]: r[h] }), {}),
    );
    return { ...previewData, headers, rows };
  }, [previewData, selectedColumns]);

  const columnInfo = useMemo(
    () =>
      AVAILABLE_COLUMNS.map((c) => ({
        ...c,
        isAvailable: previewData?.headers?.includes(c.key) ?? false,
        isSelected: selectedColumns[c.key] ?? false,
      })),
    [previewData?.headers, selectedColumns],
  );

  /* Derived lists */
  const availableOptionalColumns = useMemo(
    () => columnInfo.filter((c) => c.isAvailable && !c.required),
    [columnInfo],
  );

  /* Handlers */
  const handleSelectAll = useCallback(() => {
    // select all optional available columns (idempotent)
    availableOptionalColumns.forEach((c) => {
      if (!c.isSelected) onToggleColumn(c.key);
    });
  }, [availableOptionalColumns, onToggleColumn]);

  const handleClearAll = useCallback(() => {
    // clear all optional available columns (idempotent)
    availableOptionalColumns.forEach((c) => {
      if (c.isSelected) onToggleColumn(c.key);
    });
  }, [availableOptionalColumns, onToggleColumn]);

  const handleCheckboxChange = useCallback(
    (col) => {
      if (!col.isAvailable || col.required) return; // guard
      onToggleColumn(col.key);
    },
    [onToggleColumn],
  );

  /* Loading State */
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
          <LoadingSpinner size={32} text="Preparing your data preview..." />
        </div>
      </ReusableDialog>
    );
  }

  /* Error State */
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
      >
        <p className="text-center text-gray-600 dark:text-gray-400 py-6">
          {previewError}
        </p>
      </ReusableDialog>
    );
  }

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Data Preview"
      subtitle="Review and select columns for your dataset"
      size="5xl"
      icon={AqEye}
      iconColor="text-blue-500"
      iconBgColor="bg-blue-50 dark:bg-blue-900/20"
      contentClassName="max-h-[70vh] overflow-hidden"
      showFooter
      customFooter={
        <div className="flex justify-end gap-2 ">
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={downloadLoading}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            onClick={onConfirmDownload}
            disabled={downloadLoading || !filteredData?.headers?.length}
            Icon={downloadLoading ? undefined : AqDownload02}
          >
            {downloadLoading ? 'Downloading...' : 'Download Data'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 p-4">
        <SelectionSummary
          selectedItemsInfo={previewData?.selectedItemsInfo}
          dateRange={previewData?.dateRange}
        />

        {previewData?.previewNote && (
          <SelectionMessage type="warning">
            {previewData.previewNote}
          </SelectionMessage>
        )}

        {/* Column Selection */}
        <div className="border rounded-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Select Columns
            </h4>
            <div className="flex gap-2">
              {availableOptionalColumns.length > 0 && (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleSelectAll}
                    size="sm"
                    aria-label="Select all optional columns"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClearAll}
                    size="sm"
                    aria-label="Clear all optional columns"
                  >
                    Clear
                  </Button>
                </>
              )}
              <Button
                variant="outlined"
                onClick={onResetColumns}
                size="sm"
                aria-label="Reset to defaults"
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {columnInfo.map((col) => (
              <label
                key={col.key}
                className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  checked={col.isSelected}
                  disabled={!col.isAvailable || col.required}
                  onChange={() => handleCheckboxChange(col)}
                  className="h-4 w-4"
                  aria-label={col.label}
                />
                <span>
                  {col.label}
                  {col.required && (
                    <span className="ml-1 text-xs text-blue-600">
                      (Required)
                    </span>
                  )}
                  {!col.isAvailable && (
                    <span className="ml-1 text-xs text-red-500">
                      (Not available)
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Data Preview Table */}
        {filteredData && (
          <div className="border rounded-md">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b">
              <h4 className="font-semibold">
                Data Preview ({filteredData.rows?.length || 0} rows)
              </h4>
            </div>
            <div className="overflow-auto max-h-80">
              {filteredData.headers?.length > 0 ? (
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                    <tr>
                      {filteredData.headers.map((header) => {
                        const col = AVAILABLE_COLUMNS.find(
                          (c) => c.key === header,
                        );
                        return (
                          <th
                            key={header}
                            className="px-3 py-2 text-left text-xs font-semibold border-b"
                          >
                            {col?.label || header}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.rows?.map((row, idx) => (
                      <TableRow
                        key={idx}
                        row={row}
                        headers={filteredData.headers}
                        index={idx}
                      />
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No columns selected for preview
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ReusableDialog>
  );
};

DataPreviewDialog.displayName = 'DataPreviewDialog';

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

export default DataPreviewDialog;
