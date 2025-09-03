import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import ReusableDialog from '@/common/components/Modal/ReusableDialog';
import Button from '@/common/components/Button';
import { AqDownload02, AqInfoCircle } from '@airqo/icons-react';

const DownloadConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  downloadParams = {},
}) => {
  const {
    selectedSites = [],
    dataType = 'calibrated',
    pollutant = 'PM2.5',
    frequency = 'daily',
    dateRange = {},
  } = downloadParams || {};

  const formatDateSafe = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Data Download"
      subtitle="Review your download parameters before proceeding"
      size="lg"
      icon={AqInfoCircle}
      iconColor="text-blue-500"
      iconBgColor="bg-blue-50 dark:bg-blue-900/20"
      showFooter
      customFooter={
        <div className="flex justify-end gap-2">
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="filled"
            onClick={onConfirm}
            disabled={loading}
            Icon={loading ? undefined : AqDownload02}
          >
            {loading ? 'Downloading...' : 'Download Data'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 p-4">
        {/* Download Summary */}
        <div className="border rounded-md bg-gray-50 dark:bg-gray-800 p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Download Summary
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data Type */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Data Type
              </label>
              <p className="text-sm text-gray-900 dark:text-white capitalize">
                {dataType === 'calibrated' ? 'Calibrated Data' : 'Raw Data'}
              </p>
            </div>

            {/* Pollutant */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pollutant
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {pollutant}
              </p>
            </div>

            {/* Frequency */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Frequency
              </label>
              <p className="text-sm text-gray-900 dark:text-white capitalize">
                {frequency}
              </p>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Date Range
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDateSafe(dateRange.startDate)} to{' '}
                {formatDateSafe(dateRange.endDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Sites */}
        <div className="border rounded-md bg-white dark:bg-gray-900 p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Selected Favorite Locations ({selectedSites.length})
          </h4>

          {selectedSites.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedSites.map((site, index) => (
                <div
                  key={site._id || index}
                  className="flex items-center justify-between py-1 px-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <span className="text-sm text-gray-900 dark:text-white truncate">
                    {site.name ||
                      site.location_name ||
                      site.search_name ||
                      `Site ${index + 1}`}
                  </span>
                  {site.search_name && site.name !== site.search_name && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({site.search_name})
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No favorite locations selected
            </p>
          )}
        </div>

        {/* Information Note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> The data will be downloaded as a CSV file
            containing air quality measurements for your selected favorite
            locations within the specified date range and frequency.
          </p>
        </div>
      </div>
    </ReusableDialog>
  );
};

DownloadConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  downloadParams: PropTypes.shape({
    selectedSites: PropTypes.array,
    dataType: PropTypes.string,
    pollutant: PropTypes.string,
    frequency: PropTypes.string,
    dateRange: PropTypes.shape({
      startDate: PropTypes.string,
      endDate: PropTypes.string,
    }),
  }),
};

export default DownloadConfirmDialog;
