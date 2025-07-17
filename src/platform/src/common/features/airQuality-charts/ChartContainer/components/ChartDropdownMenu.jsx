import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CheckIcon from '@/icons/tickIcon';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { ChartExportUtils } from '../utils/chartExportUtils';
import CustomToast from '@/components/Toast/CustomToast';
import StandardsMenu from './StandardsMenu';

const ChartDropdownMenu = ({
  chartContentRef,
  chartTitle,
  isDark,
  isRefreshing,
  onRefresh,
  onExportStart,
  onExportComplete,
  onExportError,
}) => {
  const dispatch = useDispatch();
  const [loadingFormat, setLoadingFormat] = useState(null);
  const [downloadComplete, setDownloadComplete] = useState(null);
  const [exportError, setExportError] = useState(null);

  const userSelectedSites = useSelector(
    (state) => state.defaults.individual_preferences?.[0]?.selected_sites || [],
  );

  const handleExport = useCallback(
    async (format) => {
      if (
        !chartContentRef.current ||
        !ChartExportUtils.EXPORT_FORMATS.includes(format)
      ) {
        return;
      }

      setDownloadComplete(null);
      setLoadingFormat(format);
      setExportError(null);
      onExportStart?.(format);

      try {
        const exportOptions = {
          backgroundColor: ChartExportUtils.getBackgroundColor(isDark),
          chartTitle,
        };

        await ChartExportUtils.exportChart(
          chartContentRef.current,
          format,
          exportOptions,
        );

        setDownloadComplete(format);
        onExportComplete?.(format);

        CustomToast({
          message: `Chart exported as ${format.toUpperCase()} successfully!`,
          type: 'success',
        });
      } catch (error) {
        const errorMessage = error.message || 'Export failed';
        setExportError(errorMessage);
        onExportError?.(format, errorMessage);

        CustomToast({
          message: `Failed to export chart as ${format.toUpperCase()}.`,
          type: 'error',
        });
      } finally {
        setLoadingFormat(null);
      }
    },
    [
      chartContentRef,
      chartTitle,
      isDark,
      onExportStart,
      onExportComplete,
      onExportError,
    ],
  );

  const handleOpenModal = useCallback(() => {
    dispatch(
      setModalType({ type: 'inSights', ids: [], data: userSelectedSites }),
    );
    dispatch(setOpenModal(true));
  }, [dispatch, userSelectedSites]);

  const getButtonClassName = useCallback(
    (isDisabled = false) => {
      const baseClasses =
        'flex justify-between items-center w-full px-4 py-2 text-sm transition-colors';
      const themeClasses = isDark
        ? 'text-gray-200 hover:bg-gray-700'
        : 'text-gray-700 hover:bg-gray-100';
      const disabledClasses = isDisabled
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-pointer';

      return `${baseClasses} ${themeClasses} ${disabledClasses}`;
    },
    [isDark],
  );

  const getDividerClassName = useCallback(() => {
    return isDark ? 'border-gray-600' : 'border-gray-200';
  }, [isDark]);

  const renderRefreshButton = () => (
    <button
      onClick={onRefresh}
      className={getButtonClassName(isRefreshing)}
      disabled={isRefreshing}
      aria-label="Refresh chart data"
    >
      <span>Refresh</span>
      {isRefreshing && (
        <div
          className="animate-spin h-4 w-4 border-2 border-t-blue-500 border-gray-300 rounded-full"
          aria-hidden="true"
        />
      )}
    </button>
  );

  const renderExportButtons = () => (
    <>
      {ChartExportUtils.EXPORT_FORMATS.map((format) => (
        <button
          key={format}
          onClick={() => handleExport(format)}
          className={getButtonClassName(loadingFormat || isRefreshing)}
          disabled={loadingFormat || isRefreshing}
          aria-label={`Export chart as ${format.toUpperCase()}`}
        >
          <span>Export as {format.toUpperCase()}</span>
          <span className="-mr-2 flex items-center">
            {loadingFormat === format ? (
              <div
                className="animate-spin h-4 w-4 border-2 border-t-blue-500 border-gray-300 rounded-full"
                aria-hidden="true"
              />
            ) : downloadComplete === format ? (
              <CheckIcon
                fill="#1E40AF"
                width={20}
                height={20}
                aria-label="Export completed"
              />
            ) : null}
          </span>
        </button>
      ))}
    </>
  );

  const renderMoreInsightsButton = () => (
    <button
      onClick={handleOpenModal}
      className={getButtonClassName(isRefreshing)}
      disabled={isRefreshing}
      aria-label="Open more insights modal"
    >
      <span>More insights</span>
    </button>
  );

  const renderDivider = () => <hr className={getDividerClassName()} />;

  return (
    <div className="chart-dropdown-menu">
      {renderRefreshButton()}
      {renderDivider()}
      {renderExportButtons()}
      {renderDivider()}
      {renderMoreInsightsButton()}
      <StandardsMenu isDark={isDark} />

      {/* Export error display */}
      {exportError && (
        <div className="px-4 py-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          {exportError}
        </div>
      )}
    </div>
  );
};

export default React.memo(ChartDropdownMenu);
