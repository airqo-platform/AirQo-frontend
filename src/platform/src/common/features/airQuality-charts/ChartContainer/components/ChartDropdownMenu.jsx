// src/components/ChartDropdownMenu.js

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
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
  onExport,
  exportState = {},
  disabled = false,
}) => {
  const dispatch = useDispatch();
  const timeoutRef = useRef(null);

  // Local state for UI feedback
  const [localExportState, setLocalExportState] = useState({
    loading: null,
    completed: null,
    error: null,
  });

  // Redux selectors
  const userSelectedSites = useSelector(
    (state) => state.defaults.individual_preferences?.[0]?.selected_sites || [],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Enhanced export handler with better error handling and user feedback
  const handleExport = useCallback(
    async (format) => {
      // Validation - check if ChartExportUtils is available
      if (!ChartExportUtils?.EXPORT_FORMATS) {
        CustomToast({
          message: 'Export utility not available. Please refresh the page.',
          type: 'error',
        });
        return;
      }
      if (
        !chartContentRef?.current ||
        !ChartExportUtils.EXPORT_FORMATS.includes(format)
      ) {
        CustomToast({
          message: 'Invalid export configuration. Please try again.',
          type: 'error',
        });
        return;
      }
      if (disabled || isRefreshing || localExportState.loading) {
        return;
      }

      // Reset states
      setLocalExportState({
        loading: format,
        completed: null,
        error: null,
      });

      try {
        // Show loading toast
        CustomToast({
          message: `Preparing ${format.toUpperCase()} export...`,
          type: 'info',
          duration: 2000,
        });

        // Enhanced export options - simplified to match new utility
        const exportOptions = {
          title: chartTitle || 'Air Quality Chart',
          colors: {
            background: isDark ? '#1f2937' : '#ffffff',
            text: isDark ? '#f9fafb' : '#1f2937',
            muted: isDark ? '#9ca3af' : '#6b7280',
            border: isDark ? '#374151' : '#e5e7eb',
            accent: '#3b82f6',
          },
          export: {
            delay: 800,
            scale: 2,
            quality: 0.95,
          },
        };

        // Call the parent export handler if provided, otherwise use utility directly
        if (onExport) {
          await onExport(format, exportOptions);
        } else {
          await ChartExportUtils.exportChart(
            chartContentRef.current,
            format,
            exportOptions,
          );
        }

        // Success state
        setLocalExportState((prev) => ({
          ...prev,
          loading: null,
          completed: format,
        }));

        // Success toast
        CustomToast({
          message: `Chart exported as ${format.toUpperCase()} successfully!`,
          type: 'success',
          duration: 3000,
        });

        // Auto-clear completed state after delay
        timeoutRef.current = setTimeout(() => {
          setLocalExportState((prev) => ({
            ...prev,
            completed: null,
          }));
        }, 3000);
      } catch (error) {
        console.error('Export failed:', error);
        const errorMessage =
          error.message || 'Export failed. Please try again.';
        setLocalExportState((prev) => ({
          ...prev,
          loading: null,
          error: errorMessage,
        }));

        // Error toast with more context
        CustomToast({
          message: `Failed to export chart as ${format.toUpperCase()}: ${errorMessage}`,
          type: 'error',
          duration: 5000,
        });

        // Auto-clear error state after delay
        timeoutRef.current = setTimeout(() => {
          setLocalExportState((prev) => ({
            ...prev,
            error: null,
          }));
        }, 5000);
      }
    },
    [
      chartContentRef,
      chartTitle,
      disabled,
      isRefreshing,
      localExportState.loading,
      onExport,
      exportState,
      isDark,
    ],
  );

  // Enhanced modal handler
  const handleOpenModal = useCallback(() => {
    if (disabled || isRefreshing) return;
    try {
      dispatch(
        setModalType({
          type: 'inSights',
          ids: [],
          data: userSelectedSites,
          timestamp: Date.now(),
        }),
      );
      dispatch(setOpenModal(true));
    } catch (error) {
      console.error('Failed to open insights modal:', error);
      CustomToast({
        message: 'Failed to open insights. Please try again.',
        type: 'error',
      });
    }
  }, [dispatch, userSelectedSites, disabled, isRefreshing]);

  // Memoized button class generator
  const getButtonClassName = useCallback(
    (isDisabled = false, isActive = false) => {
      const baseClasses =
        'flex justify-between items-center w-full px-4 py-2.5 text-sm transition-colors duration-150';
      const themeClasses = isDark
        ? 'text-gray-200 hover:bg-gray-700 focus:bg-gray-700'
        : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100';
      const stateClasses = isDisabled
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-pointer';
      const activeClasses = isActive
        ? isDark
          ? 'bg-gray-700 border-l-2 border-blue-400'
          : 'bg-gray-100 border-l-2 border-blue-500'
        : '';
      return `${baseClasses} ${themeClasses} ${stateClasses} ${activeClasses}`.trim();
    },
    [isDark],
  );

  // Memoized divider class
  const dividerClassName = useMemo(
    () => `border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`,
    [isDark],
  );

  // Loading spinner component
  const LoadingSpinner = useMemo(
    () => (
      <div
        className="animate-spin h-4 w-4 border-2 border-t-blue-500 border-gray-300 rounded-full"
        aria-hidden="true"
      />
    ),
    [],
  );

  // Check if any export is in progress
  const isExporting = useMemo(
    () => localExportState.loading || exportState.isExporting,
    [localExportState.loading, exportState.isExporting],
  );

  // Get available export formats safely
  const availableFormats = useMemo(() => {
    return ChartExportUtils?.EXPORT_FORMATS || ['pdf', 'png'];
  }, []);

  // Render refresh button
  const renderRefreshButton = () => (
    <button
      onClick={onRefresh}
      className={getButtonClassName(isRefreshing || disabled)}
      disabled={isRefreshing || disabled}
      aria-label="Refresh chart data"
      role="menuitem"
    >
      <span className="flex items-center space-x-2">
        <svg
          className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span>Refresh Data</span>
      </span>
    </button>
  );

  // Render export buttons with enhanced feedback
  const renderExportButtons = () => (
    <div role="group" aria-label="Export options">
      {availableFormats.map((format) => {
        const isLoading =
          localExportState.loading === format || exportState.format === format;
        const isCompleted = localExportState.completed === format;
        const isDisabled = isExporting || disabled || isRefreshing;
        return (
          <button
            key={format}
            onClick={() => handleExport(format)}
            className={getButtonClassName(isDisabled, isLoading)}
            disabled={isDisabled}
            aria-label={`Export chart as ${format.toUpperCase()}`}
            role="menuitem"
          >
            <span className="flex items-center space-x-2">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Export as {format.toUpperCase()}</span>
            </span>
            <span className="flex items-center -mr-1">
              {isLoading ? (
                LoadingSpinner
              ) : isCompleted ? (
                <CheckIcon
                  fill={isDark ? '#10B981' : '#059669'}
                  width={18}
                  height={18}
                  aria-label="Export completed"
                />
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );

  // Render insights button
  const renderInsightsButton = () => (
    <button
      onClick={handleOpenModal}
      className={getButtonClassName(disabled || isRefreshing)}
      disabled={disabled || isRefreshing}
      aria-label="Open more insights modal"
      role="menuitem"
    >
      <span className="flex items-center space-x-2">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span>More Insights</span>
      </span>
    </button>
  );

  // Render error display
  const renderErrorDisplay = () => {
    const error = localExportState.error || exportState.error;
    if (!error) return null;
    return (
      <div
        className={`
          px-4 py-3 text-sm border-t transition-all duration-200
          ${
            isDark
              ? 'text-red-300 bg-red-900/20 border-red-800'
              : 'text-red-700 bg-red-50 border-red-200'
          }
        `}
        role="alert"
      >
        <div className="flex items-start space-x-2">
          <svg
            className="h-4 w-4 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className="chart-dropdown-menu"
      role="menu"
      aria-label="Chart actions menu"
    >
      {renderRefreshButton()}
      <hr className={dividerClassName} />
      {renderExportButtons()}
      <hr className={dividerClassName} />
      {renderInsightsButton()}
      <StandardsMenu isDark={isDark} />
      {renderErrorDisplay()}
    </div>
  );
};

// Enhanced memo with deeper comparison
const ChartDropdownMenuMemo = React.memo(
  ChartDropdownMenu,
  (prevProps, nextProps) => {
    // Compare all props except functions and refs
    const simpleProps = ['chartTitle', 'isDark', 'isRefreshing', 'disabled'];
    for (const prop of simpleProps) {
      if (prevProps[prop] !== nextProps[prop]) {
        return false;
      }
    }
    // Compare exportState object
    if (
      JSON.stringify(prevProps.exportState) !==
      JSON.stringify(nextProps.exportState)
    ) {
      return false;
    }
    return true;
  },
);
ChartDropdownMenuMemo.displayName = 'ChartDropdownMenu';
export default ChartDropdownMenuMemo;
