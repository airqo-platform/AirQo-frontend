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
import html2canvas from 'html2canvas';
import CheckIcon from '@/icons/tickIcon';
import CustomDropdown from '@/components/Button/CustomDropdown';
import MoreInsightsChart from './MoreInsightsChart';
import SkeletonLoader from './components/SkeletonLoader';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import CustomToast from '@/components/Toast/CustomToast';
import useOutsideClick from '@/core/hooks/useOutsideClick';
import StandardsMenu from './components/StandardsMenu';
import Card from '@/components/CardWrapper';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';

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

  const [loadingFormat, setLoadingFormat] = useState(null);
  const [downloadComplete, setDownloadComplete] = useState(null);
  const [showSkeleton, setShowSkeleton] = useState(chartLoading);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useOutsideClick(dropdownRef, () => {
    dropdownRef.current?.classList.remove('show');
    setDownloadComplete(null);
  });

  // Handle skeleton visibility based on loading state.
  useEffect(() => {
    let timer;
    if (!chartLoading) {
      timer = setTimeout(() => setShowSkeleton(false), SKELETON_DELAY);
    } else {
      setShowSkeleton(true);
    }
    return () => timer && clearTimeout(timer);
  }, [chartLoading]);

  // Handle refresh indicator state.
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

  // Cleanup timer on unmount.
  useEffect(() => {
    return () =>
      refreshTimerRef.current && clearTimeout(refreshTimerRef.current);
  }, []);

  // Export chart with canvas background matching theme.
  const exportChart = useCallback(
    async (format) => {
      if (!chartRef.current || !EXPORT_FORMATS.includes(format)) return;
      setDownloadComplete(null);
      setLoadingFormat(format);

      try {
        const canvas = await html2canvas(chartRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF', // match theme background
        });

        if (format === 'pdf') {
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height],
          });
          pdf.addImage(
            canvas.toDataURL('image/png', 0.8),
            'PNG',
            0,
            0,
            canvas.width,
            canvas.height,
          );
          pdf.save('airquality-data.pdf');
        } else {
          const link = document.createElement('a');
          link.href = canvas.toDataURL(`image/${format}`, 0.8);
          link.download = `airquality-data.${format}`;
          link.click();
        }

        setDownloadComplete(format);
        CustomToast({
          message: `Chart exported as ${format.toUpperCase()} successfully!`,
          type: 'success',
        });
      } catch (error) {
        console.error('Error exporting chart:', error);
        CustomToast({
          message: `Failed to export chart as ${format.toUpperCase()}.`,
          type: 'error',
        });
      } finally {
        setLoadingFormat(null);
      }
    },
    [isDark],
  );

  // Refresh chart data.
  const handleRefreshChart = useCallback(() => {
    setIsManualRefresh(true);
    setIsRefreshing(true);
    refetch();
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      setIsRefreshing(false);
      setIsManualRefresh(false);
    }, REFRESH_TIMEOUT);
  }, [refetch]);

  // Open modal for additional insights.
  const handleOpenModal = useCallback(() => {
    dispatch(
      setModalType({ type: 'inSights', ids: [], data: userSelectedSites }),
    );
    dispatch(setOpenModal(true));
  }, [dispatch, userSelectedSites]);

  // Dropdown menu content with dark mode support.
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
        <div className="absolute top-12 right-4 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md flex items-center z-20 shadow-sm">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-medium">Refreshing data</span>
        </div>
      ),
    [isManualRefresh, isRefreshing],
  );

  // Error Overlay if no sites to display.
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }, [error, chartSites.length, refetch, isDark]);

  // Optional card header.
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

  // Main chart content with overlay for skeleton or error.
  const chartContent = useMemo(
    () => (
      <div className="relative" style={{ width, height }}>
        {ErrorOverlay}
        {showSkeleton ? (
          <SkeletonLoader width={width} height={height} />
        ) : (
          <MoreInsightsChart
            data={data}
            selectedSites={chartSites}
            chartType={chartType}
            frequency={timeFrame}
            width="100%"
            height={height}
            id={id}
            pollutantType={pollutionType}
            refreshChart={handleRefreshChart}
            isRefreshing={isRefreshing}
          />
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
    ],
  );

  return (
    <div className="relative" id={id}>
      {RefreshIndicator}
      <Card
        header={cardHeader}
        padding="p-0"
        width="w-full"
        overflow={false}
        className={`relative overflow-hidden ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
        contentClassName="p-0"
        headerProps={{
          className: 'pt-4 pb-2 px-6 flex items-center justify-between',
        }}
      >
        <div ref={chartRef} className="p-4 pt-0">
          {chartContent}
        </div>
      </Card>
    </div>
  );
};

export default React.memo(ChartContainer);
