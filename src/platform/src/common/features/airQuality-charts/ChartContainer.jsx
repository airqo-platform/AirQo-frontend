'use client';
import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image-more';
import CheckIcon from '@/icons/tickIcon';
import CustomDropdown from '@/components/Button/CustomDropdown';
import MoreInsightsChart from './MoreInsightsChart';
import SkeletonLoader from './components/SkeletonLoader';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import CustomToast from '@/components/Toast/CustomToast';
import useOutsideClick from '@/core/hooks/useOutsideClick';
import StandardsMenu from './components/StandardsMenu';
import Card from '@/components/CardWrapper';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import Spinner from '@/components/Spinner';
import { useOrganizationLoading } from '@/app/providers/OrganizationLoadingProvider';

const EXPORT_FORMATS = ['png', 'jpg', 'pdf'];
const SKELETON_DELAY = 500;
const REFRESH_TIMEOUT = 10000;

const ChartContainer = ({
  chartType,
  chartTitle,
  height = '300px',
  width = '100%',
  id,
  showTitle = true,
  data = [],
  chartLoading,
  error,
  refetch,
  isValidating,
}) => {
  const dispatch = useDispatch();
  const chartRef = useRef(null);
  const chartContentRef = useRef(null);
  const dropdownRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const { theme, systemTheme } = useTheme();
  const isDark =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const { chartSites, timeFrame, pollutionType } = useSelector(
    (state) => state.chart,
  );
  const userSelectedSites = useSelector(
    (state) => state.defaults.individual_preferences?.[0]?.selected_sites || [],
  );
  // Organization loading context
  const { isOrganizationLoading } = useOrganizationLoading();

  const [loadingFormat, setLoadingFormat] = useState(null);
  const [downloadComplete, setDownloadComplete] = useState(null);
  const [showSkeleton, setShowSkeleton] = useState(chartLoading);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportError, setExportError] = useState(null);

  useOutsideClick(dropdownRef, () => {
    dropdownRef.current?.classList.remove('show');
    setDownloadComplete(null);
  });

  // Handle skeleton visibility based on loading state (including organization switching)
  useEffect(() => {
    let timer;
    if (!chartLoading && !isOrganizationLoading) {
      timer = setTimeout(() => setShowSkeleton(false), SKELETON_DELAY);
    } else {
      setShowSkeleton(true);
    }
    return () => timer && clearTimeout(timer);
  }, [chartLoading, isOrganizationLoading]);

  // Handle refresh indicator state
  useEffect(() => {
    let timer;
    if (!isManualRefresh) return;
    if (chartLoading || (isValidating && !chartLoading)) {
      setIsRefreshing(true);
    } else if (!isValidating && !chartLoading && isRefreshing) {
      timer = setTimeout(() => {
        setIsRefreshing(false);
        setIsManualRefresh(false);
      }, SKELETON_DELAY);
    }
    return () => timer && clearTimeout(timer);
  }, [isValidating, chartLoading, isRefreshing, isManualRefresh]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () =>
      refreshTimerRef.current && clearTimeout(refreshTimerRef.current);
  }, []);

  // Enhanced export chart function with dom-to-image-more
  const exportChart = useCallback(
    async (format) => {
      if (!chartContentRef.current || !EXPORT_FORMATS.includes(format)) return;

      setDownloadComplete(null);
      setLoadingFormat(format);
      setExportError(null);

      try {
        // Wait for chart rendering to complete
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Apply temporary class for better export quality
        chartContentRef.current.classList.add('exporting');

        // Configure export options for better quality
        const exportOptions = {
          width: chartContentRef.current.offsetWidth,
          height: chartContentRef.current.offsetHeight,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
          },
          quality: format === 'jpg' ? 0.95 : 1.0,
          bgcolor: isDark ? '#1F2937' : '#FFFFFF',
          filter: (node) => {
            // Filter out certain elements that might cause issues
            if (node.classList) {
              return (
                !node.classList.contains('dropdown') &&
                !node.classList.contains('tooltip')
              );
            }
            return true;
          },
        };

        let dataUrl;

        // Use appropriate method based on format
        if (format === 'png') {
          dataUrl = await domtoimage.toPng(
            chartContentRef.current,
            exportOptions,
          );
        } else if (format === 'jpg') {
          dataUrl = await domtoimage.toJpeg(
            chartContentRef.current,
            exportOptions,
          );
        } else {
          // For PDF, first convert to PNG then to PDF
          dataUrl = await domtoimage.toPng(
            chartContentRef.current,
            exportOptions,
          );
        }

        // Remove temporary class
        chartContentRef.current.classList.remove('exporting');

        // Process export based on format
        if (format === 'pdf') {
          // Create PDF with proper dimensions
          const img = new window.Image();
          img.onload = () => {
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape for better chart viewing
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate dimensions to fit the chart properly
            const imgAspectRatio = img.width / img.height;
            const pdfAspectRatio = pdfWidth / pdfHeight;

            let finalWidth, finalHeight;

            if (imgAspectRatio > pdfAspectRatio) {
              // Image is wider relative to PDF
              finalWidth = pdfWidth - 20; // 10mm margin on each side
              finalHeight = finalWidth / imgAspectRatio;
            } else {
              // Image is taller relative to PDF
              finalHeight = pdfHeight - 20; // 10mm margin on top and bottom
              finalWidth = finalHeight * imgAspectRatio;
            }

            // Center the image
            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;

            // Add title
            pdf.setFontSize(16);
            pdf.text(chartTitle || 'Air Quality Chart', pdfWidth / 2, 15, {
              align: 'center',
            });

            // Add image
            pdf.addImage(dataUrl, 'PNG', x, y, finalWidth, finalHeight);

            // Add timestamp
            pdf.setFontSize(10);
            const timestamp = new Date().toLocaleString();
            pdf.text(`Generated on: ${timestamp}`, 10, pdfHeight - 10);

            pdf.save(
              `air-quality-chart-${new Date().toISOString().slice(0, 10)}.pdf`,
            );
          };
          img.src = dataUrl;
        } else {
          // For PNG/JPG, create download link
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `air-quality-chart-${new Date().toISOString().slice(0, 10)}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        setDownloadComplete(format);
        CustomToast({
          message: `Chart exported as ${format.toUpperCase()} successfully!`,
          type: 'success',
        });
      } catch (error) {
        // Remove temporary class if error occurs
        if (chartContentRef.current) {
          chartContentRef.current.classList.remove('exporting');
        }

        setExportError(error.message || 'Export failed');
        CustomToast({
          message: `Failed to export chart as ${format.toUpperCase()}.`,
          type: 'error',
        });
      } finally {
        setLoadingFormat(null);
      }
    },
    [isDark, chartTitle],
  );

  // Refresh chart data
  const handleRefreshChart = useCallback(() => {
    setIsManualRefresh(true);
    setIsRefreshing(true);
    refetch();

    // Cleanup any existing timer
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    // Set timeout for auto-resetting refresh state
    refreshTimerRef.current = setTimeout(() => {
      setIsRefreshing(false);
      setIsManualRefresh(false);
    }, REFRESH_TIMEOUT);
  }, [refetch]);

  // Open modal for additional insights
  const handleOpenModal = useCallback(() => {
    dispatch(
      setModalType({ type: 'inSights', ids: [], data: userSelectedSites }),
    );
    dispatch(setOpenModal(true));
  }, [dispatch, userSelectedSites]);

  // Dropdown menu content with dark mode support
  const renderDropdownContent = useMemo(
    () => (
      <>
        {/* Refresh Item */}
        <button
          onClick={handleRefreshChart}
          className={`flex justify-between items-center w-full px-4 py-2 text-sm ${
            isDark
              ? 'text-gray-200 hover:bg-gray-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          disabled={isRefreshing}
        >
          <span>Refresh</span>
          {isRefreshing && (
            <div className="animate-spin h-4 w-4 border-2 border-t-blue-500 border-gray-300 rounded-full" />
          )}
        </button>
        <hr className={`${isDark ? 'border-gray-600' : 'border-gray-200'}`} />

        {/* Export Items */}
        {EXPORT_FORMATS.map((format) => (
          <button
            key={format}
            onClick={() => exportChart(format)}
            className={`flex justify-between items-center w-full px-4 py-2 text-sm ${
              isDark
                ? 'text-gray-200 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            disabled={loadingFormat || isRefreshing}
          >
            <span>Export as {format.toUpperCase()}</span>
            <span className="-mr-2 flex items-center">
              {loadingFormat === format ? (
                <div className="animate-spin h-4 w-4 border-2 border-t-blue-500 border-gray-300 rounded-full" />
              ) : downloadComplete === format ? (
                <CheckIcon fill="#1E40AF" width={20} height={20} />
              ) : null}
            </span>
          </button>
        ))}
        <hr className={`${isDark ? 'border-gray-600' : 'border-gray-200'}`} />

        {/* More Insights and Standards */}
        <button
          onClick={handleOpenModal}
          className={`flex justify-between items-center w-full px-4 py-2 text-sm ${
            isDark
              ? 'text-gray-200 hover:bg-gray-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          disabled={isRefreshing}
        >
          <span>More insights</span>
        </button>
        <StandardsMenu isDark={isDark} />
      </>
    ),
    [
      handleRefreshChart,
      isRefreshing,
      exportChart,
      loadingFormat,
      downloadComplete,
      handleOpenModal,
      isDark,
    ],
  );

  // Refresh Indicator
  const RefreshIndicator = useMemo(
    () =>
      isManualRefresh &&
      isRefreshing && (
        <div className="absolute top-12 left-4 bg-blue-50 text-primary px-3 py-1.5 rounded-md flex items-center z-20 shadow-sm">
          <Spinner width={12} height={12} />
          <span className="text-sm font-medium ml-2">Refreshing data</span>
        </div>
      ),
    [isManualRefresh, isRefreshing],
  );

  // Error Overlay if no sites to display
  const ErrorOverlay = useMemo(() => {
    if (!error || chartSites.length > 0) return null;
    return (
      <div
        className={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center p-4 z-10 rounded-md ${
          isDark ? 'bg-gray-800 bg-opacity-80' : 'bg-gray-100 bg-opacity-80'
        }`}
      >
        <div
          className={`p-4 rounded-lg shadow-md flex flex-col items-center max-w-md ${
            isDark ? 'bg-gray-700' : 'bg-white'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: isDark ? '#F87171' : '#EF4444' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p
            className="font-medium mb-2 text-center"
            style={{ color: isDark ? '#F87171' : '#EF4444' }}
          >
            Unable to load chart data
          </p>
          <p
            className="text-sm mb-4 text-center"
            style={{ color: isDark ? '#D1D5DB' : '#4B5563' }}
          >
            {error?.message ||
              'There was a problem retrieving the data. Please try again.'}
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-primary text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }, [error, chartSites.length, refetch, isDark]);

  // Optional card header
  const cardHeader = useMemo(() => {
    if (!showTitle) return null;
    return (
      <div className="flex items-center justify-between w-full">
        <h3
          className="text-lg font-medium"
          style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}
        >
          {chartTitle}
        </h3>
        <div ref={dropdownRef}>
          <CustomDropdown
            text="More"
            dropdownAlign="right"
            dropdownWidth="180px"
            buttonStyle={{
              fontSize: '0.875rem',
              padding: '0.3rem 0.5rem',
              background: 'transparent',
              color: isDark ? '#F9FAFB' : '#1F2937',
            }}
          >
            {renderDropdownContent}
          </CustomDropdown>
        </div>
      </div>
    );
  }, [showTitle, chartTitle, renderDropdownContent, isDark]);

  // Main chart content with overlay for skeleton or error
  const chartContent = useMemo(
    () => (
      <div
        className="relative export-chart-container"
        style={{ width, height, minHeight: '380px' }}
      >
        {ErrorOverlay}
        {showSkeleton ? (
          <SkeletonLoader width={width} height={height} />
        ) : (
          <div
            ref={chartContentRef}
            className="w-full h-full chart-content"
            style={{
              padding: '24px 16px 16px 4px',
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              margin: 0,
            }}
          >
            <MoreInsightsChart
              data={data}
              selectedSites={chartSites}
              chartType={chartType}
              frequency={timeFrame}
              id={id}
              pollutantType={pollutionType}
              refreshChart={handleRefreshChart}
              isRefreshing={isRefreshing}
              width="100%"
              height="100%"
            />
          </div>
        )}
      </div>
    ),
    [
      width,
      height,
      ErrorOverlay,
      showSkeleton,
      data,
      chartSites,
      chartType,
      timeFrame,
      id,
      pollutionType,
      handleRefreshChart,
      isRefreshing,
      isDark,
    ],
  );

  // Add CSS styles to help with export and improve appearance
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      .export-chart-container {
        position: relative;
        overflow: visible !important;
        background: ${isDark ? '#1F2937' : '#FFFFFF'};
      }
      .chart-content {
        transform-origin: top left;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
      }
      .chart-content.exporting {
        overflow: visible !important;
        height: auto !important;
        box-shadow: none !important;
        border: none !important;
      }
      .chart-content.exporting .recharts-wrapper,
      .chart-content.exporting .recharts-surface {
        overflow: visible !important;
      }
      .chart-content.exporting .recharts-legend-wrapper {
        overflow: visible !important;
        position: relative !important;
      }
      .chart-container {
        padding: 0 !important;
        margin: 0 !important;
      }
      /* Enhanced chart styling */
      .recharts-cartesian-grid line {
        stroke-opacity: 0.3;
      }
      .recharts-legend-item {
        margin-right: 16px !important;
      }
      .recharts-tooltip-wrapper {
        z-index: 100 !important;
      }
      /* Ensure proper chart sizing and spacing */
      .recharts-wrapper {
        width: 100% !important;
        height: 100% !important;
      }
      .recharts-surface {
        overflow: visible !important;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, [isDark]);
  return (
    <div className="relative" id={id} ref={chartRef}>
      {RefreshIndicator}
      <Card
        header={cardHeader}
        padding="p-0"
        width="w-full"
        overflow={false}
        className={`relative border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
        contentClassName="p-0 m-0"
        headerProps={{
          className:
            'pt-4 pb-2 px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700',
        }}
      >
        <div className="chart-container p-0 m-0">{chartContent}</div>
      </Card>

      {/* Export error message if any */}
      {exportError && (
        <div className="absolute bottom-2 right-2 bg-red-100 text-red-700 px-3 py-1 rounded text-sm z-50">
          {exportError}
        </div>
      )}
    </div>
  );
};

export default React.memo(ChartContainer);
