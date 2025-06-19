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

const EXPORT_FORMATS = ['png', 'jpg', 'pdf'];
const SKELETON_DELAY = 500;
const REFRESH_TIMEOUT = 10000;

// Optimized chart configuration with consistent settings
const CHART_CONFIG = {
  // Unified dimensions - single source of truth
  dimensions: {
    defaultHeight: 250,
    minHeight: 220,
    aspectRatio: 16 / 9,
  },
  // Simplified padding - removed from chart content, handled by container
  spacing: {
    containerPadding: '0.5rem',
    chartMargin: { top: 20, right: 20, bottom: 60, left: 20 },
  },
  exportSettings: {
    quality: 0.95,
    backgroundColor: (isDark) => (isDark ? '#1F2937' : '#FFFFFF'),
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },
};

const ChartContainer = ({
  chartType,
  chartTitle,
  height,
  width,
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
  // Remove the organization loading hook as it's no longer needed

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
  // Handle skeleton visibility based on loading state
  useEffect(() => {
    let timer;
    if (!chartLoading) {
      timer = setTimeout(() => setShowSkeleton(false), SKELETON_DELAY);
    } else {
      setShowSkeleton(true);
    }
    return () => timer && clearTimeout(timer);
  }, [chartLoading]);

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
  // Calculate responsive dimensions - single source of truth
  const chartDimensions = useMemo(() => {
    const containerWidth = width || '100%';
    // Set a responsive height that works well with headers - reduced further to 250
    const calculatedHeight = height || 250; // Reduced default height from 300 to 250

    // Ensure reasonable height range
    const finalHeight =
      typeof calculatedHeight === 'number'
        ? Math.max(calculatedHeight, 190) // Reduced minimum height from 280 to 220
        : calculatedHeight;

    return {
      width: containerWidth,
      height: finalHeight,
      containerStyle: {
        width: containerWidth,
        minHeight: 220, // Reduced minimum height from 280 to 220
        height:
          typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
      },
    };
  }, [width, height]);
  // Enhanced export chart function with dom-to-image-more
  const exportChart = useCallback(
    async (format) => {
      if (!chartContentRef.current || !EXPORT_FORMATS.includes(format)) return;

      setDownloadComplete(null);
      setLoadingFormat(format);
      setExportError(null);

      try {
        // Wait for chart rendering to complete and any animations to finish
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Get the actual chart element (without padding container)
        const chartElement =
          chartContentRef.current.querySelector('.recharts-wrapper') ||
          chartContentRef.current;

        // Apply temporary class for better export quality
        chartContentRef.current.classList.add('exporting');

        // Calculate proper dimensions for high-quality export
        const actualWidth = chartElement.offsetWidth;
        const actualHeight = chartElement.offsetHeight;
        const scale = 2; // Higher scale for better quality        // Configure export options for better quality and consistent styling
        const exportOptions = {
          width: actualWidth * scale,
          height: actualHeight * scale,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${actualWidth}px`,
            height: `${actualHeight}px`,
            padding: '0',
            margin: '0',
            overflow: 'visible',
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '12px',
            fontWeight: '500',
          },
          quality: format === 'jpg' ? 0.98 : 1.0,
          bgcolor: isDark ? '#1F2937' : '#FFFFFF',
          imagePlaceholder: '',
          cacheBust: true,
          filter: (node) => {
            // Filter out problematic elements
            if (node.classList) {
              return (
                !node.classList.contains('dropdown') &&
                !node.classList.contains('tooltip') &&
                !node.classList.contains('recharts-tooltip-wrapper') &&
                !node.classList.contains('absolute') &&
                !node.id?.includes('dropdown')
              );
            }
            // Filter out text nodes that are whitespace only
            if (node.nodeType === 3) {
              // 3 is TEXT_NODE constant
              return node.textContent.trim() !== '';
            }
            return true;
          },
        };

        let dataUrl;

        // Use appropriate method based on format with better element targeting
        if (format === 'png') {
          dataUrl = await domtoimage.toPng(chartElement, exportOptions);
        } else if (format === 'jpg') {
          dataUrl = await domtoimage.toJpeg(chartElement, exportOptions);
        } else {
          // For PDF, first convert to PNG then to PDF
          dataUrl = await domtoimage.toPng(chartElement, exportOptions);
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

            // Calculate dimensions to fit the chart properly with margins
            const margin = 20; // 20mm margin
            const availableWidth = pdfWidth - margin * 2;
            const availableHeight = pdfHeight - margin * 3; // Extra margin for title and timestamp

            const imgAspectRatio = img.width / img.height;
            const availableAspectRatio = availableWidth / availableHeight;

            let finalWidth, finalHeight;

            if (imgAspectRatio > availableAspectRatio) {
              // Image is wider relative to available space
              finalWidth = availableWidth;
              finalHeight = finalWidth / imgAspectRatio;
            } else {
              // Image is taller relative to available space
              finalHeight = availableHeight;
              finalWidth = finalHeight * imgAspectRatio;
            }

            // Center the image
            const x = (pdfWidth - finalWidth) / 2;
            const y = margin + 20; // Leave space for title

            // Add title
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text(chartTitle || 'Air Quality Chart', pdfWidth / 2, margin, {
              align: 'center',
            });

            // Add image with high quality
            pdf.addImage(
              dataUrl,
              'PNG',
              x,
              y,
              finalWidth,
              finalHeight,
              '',
              'FAST',
            );

            // Add timestamp and metadata
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const timestamp = new Date().toLocaleString();
            pdf.text(`Generated on: ${timestamp}`, margin, pdfHeight - 10);

            // Add page info
            pdf.text(
              `AirQo Platform - Air Quality Data`,
              pdfWidth - margin,
              pdfHeight - 10,
              {
                align: 'right',
              },
            );

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
        className="relative export-chart-container w-full h-full"
        style={chartDimensions.containerStyle}
      >
        {ErrorOverlay}
        {showSkeleton ? (
          <SkeletonLoader
            width={chartDimensions.width}
            height={chartDimensions.height}
          />
        ) : (
          <div
            ref={chartContentRef}
            className="w-full h-full chart-content"
            style={{
              padding: CHART_CONFIG.spacing.containerPadding,
              margin: 0,
              overflow: 'hidden',
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
      chartDimensions,
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
        overflow: visible !important;
      }
      .chart-content.exporting {
        overflow: visible !important;
        height: auto !important;
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        background: ${isDark ? '#1F2937' : '#FFFFFF'} !important;
      }
      .chart-content.exporting .recharts-wrapper,
      .chart-content.exporting .recharts-surface {
        overflow: visible !important;
        background: ${isDark ? '#1F2937' : '#FFFFFF'} !important;
      }
      .chart-content.exporting .recharts-legend-wrapper {
        overflow: visible !important;
        position: relative !important;
      }
      .chart-content.exporting .recharts-cartesian-axis {
        overflow: visible !important;
      }
      .chart-content.exporting .recharts-cartesian-axis-tick {
        overflow: visible !important;
      }
      .chart-container {
        padding: 0 !important;
        margin: 0 !important;
      }
      /* Enhanced chart styling for better exports */
      .recharts-cartesian-grid line {
        stroke-opacity: 0.3;
      }
      .recharts-legend-item {
        margin-right: 16px !important;
      }
      .recharts-tooltip-wrapper {
        z-index: 100 !important;
        display: none !important; /* Hide tooltips in exports */
      }
      .chart-content.exporting .recharts-tooltip-wrapper {
        display: none !important;
      }
      /* Ensure proper chart sizing and spacing */
      .recharts-wrapper {
        width: 100% !important;
        height: 100% !important;
        overflow: visible !important;
      }
      .recharts-surface {
        overflow: visible !important;
        background: ${isDark ? '#1F2937' : '#FFFFFF'} !important;
      }      /* Better text rendering for exports */
      .recharts-text {
        font-family: ${CHART_CONFIG.exportPadding ? 'system-ui, -apple-system, sans-serif' : 'system-ui, -apple-system, sans-serif'} !important;
        font-weight: 500 !important;
      }
      .recharts-cartesian-axis-tick text {
        font-size: 12px !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        fill: ${isDark ? '#D1D5DB' : '#4B5563'} !important;
      }
      .recharts-legend-item text {
        font-size: 14px !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        fill: ${isDark ? '#F9FAFB' : '#1F2937'} !important;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, [isDark]);
  return (
    <div className="relative w-full" id={id} ref={chartRef}>
      {RefreshIndicator}
      <Card
        header={cardHeader}
        padding="p-0"
        width="w-full"
        overflow={false}
        className={`relative border rounded-lg shadow-sm transition-colors duration-200 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
        contentClassName="p-0 m-0 rounded-b-lg overflow-hidden"
        headerProps={{
          className:
            'pt-4 pb-2 px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 rounded-t-lg',
        }}
      >
        <div
          className="chart-container w-full h-full flex items-center justify-center overflow-hidden"
          style={chartDimensions.containerStyle}
        >
          {chartContent}
        </div>
      </Card>

      {/* Export error message if any */}
      {exportError && (
        <div className="absolute bottom-2 right-2 bg-red-100 text-red-700 px-3 py-1 rounded text-sm z-50 transition-opacity duration-200">
          {exportError}
        </div>
      )}
    </div>
  );
};

export default React.memo(ChartContainer);
