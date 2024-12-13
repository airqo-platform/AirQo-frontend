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
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import MoreInsightsChart from './MoreInsightsChart';
import SkeletonLoader from './components/SkeletonLoader';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import CustomToast from '../Toast/CustomToast';
import useOutsideClick from '@/core/hooks/useOutsideClick';

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
}) => {
  const dispatch = useDispatch();
  const chartRef = useRef(null);
  const dropdownRef = useRef(null);

  // Extract necessary data from Redux store
  const { chartSites, timeFrame, pollutionType } = useSelector(
    (state) => state.chart,
  );
  const preferencesData = useSelector(
    (state) => state.defaults.individual_preferences,
  );
  const userSelectedSites = useMemo(
    () => preferencesData?.[0]?.selected_sites || [],
    [preferencesData],
  );

  // State for handling sharing and exporting
  const [loadingFormat, setLoadingFormat] = useState(null);
  const [downloadComplete, setDownloadComplete] = useState(null);

  // State for managing the SkeletonLoader visibility
  const [showSkeleton, setShowSkeleton] = useState(chartLoading);

  // Handle click outside for dropdown
  useOutsideClick(dropdownRef, () => {
    dropdownRef.current?.classList.remove('show');
    setDownloadComplete(null);
  });

  // Effect to manage SkeletonLoader visibility with delay
  useEffect(() => {
    let timer;
    if (chartLoading) {
      setShowSkeleton(true);
    } else {
      timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 5000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [chartLoading]);

  /**
   * Exports the chart in the specified format.
   * @param {string} format - The format to export the chart (png, jpg, pdf).
   */
  const exportChart = useCallback(async (format) => {
    if (!chartRef.current) return;

    setDownloadComplete(null);
    setLoadingFormat(format);

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fff',
      });

      if (['png', 'jpg'].includes(format)) {
        const imgData = canvas.toDataURL(`image/${format}`, 0.8);
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `airquality-data.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === 'pdf') {
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });
        const imgData = canvas.toDataURL('image/png', 0.8);
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('airquality-data.pdf');
      } else {
        throw new Error('Unsupported format');
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
  }, []);

  /**
   * Refreshes the chart data by calling the refetch function from the parent.
   */
  const handleRefreshChart = useCallback(() => {
    refetch();
  }, [refetch]);

  /**
   * Opens a modal with specified type and data.
   */
  const handleOpenModal = useCallback(
    (type, ids = null, data = null) => {
      dispatch(setModalType({ type, ids, data }));
      dispatch(setOpenModal(true));
    },
    [dispatch],
  );

  /**
   * Renders the content of the dropdown menu.
   */
  const renderDropdownContent = useMemo(
    () => (
      <>
        <button
          onClick={handleRefreshChart}
          className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Refresh
        </button>
        <hr className="border-gray-200" />
        {['png', 'jpg', 'pdf'].map((format) => (
          <button
            key={format}
            onClick={() => exportChart(format)}
            className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <span>Export as {format.toUpperCase()}</span>
            <span className="-mr-2 flex items-center">
              {loadingFormat === format && (
                <div className="animate-spin h-4 w-4 border-2 border-t-blue-500 border-gray-300 rounded-full"></div>
              )}
              {downloadComplete === format && (
                <CheckIcon fill="#1E40AF" width={20} height={20} />
              )}
            </span>
          </button>
        ))}
        <hr className="border-gray-200" />
        <button
          onClick={() => handleOpenModal('inSights', [], userSelectedSites)}
          className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          More insights
        </button>
      </>
    ),
    [
      handleRefreshChart,
      exportChart,
      loadingFormat,
      downloadComplete,
      handleOpenModal,
      userSelectedSites,
    ],
  );

  /**
   * Renders the error overlay with a retry option.
   */
  const ErrorOverlay = useCallback(
    () => (
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gray-300 bg-opacity-50 z-10 p-4">
        <p className="text-red-500 font-semibold mb-2">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    ),
    [refetch],
  );

  return (
    <div
      className="border bg-white rounded-xl border-gray-200 shadow-sm relative"
      id={id}
    >
      <div className="flex flex-col items-start gap-1 w-full p-4">
        {showTitle && (
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-medium">{chartTitle}</h3>
            <div ref={dropdownRef}>
              <CustomDropdown
                btnText="More"
                dropdown
                tabID={`options-btn-${id}`}
                tabStyle="py-1 px-2 rounded-xl"
                id={`options-${id}`}
                alignment="right"
              >
                {renderDropdownContent}
              </CustomDropdown>
            </div>
          </div>
        )}
        <div ref={chartRef} className="my-3 relative" style={{ width, height }}>
          {error && !chartSites.length === 0 ? (
            <ErrorOverlay />
          ) : showSkeleton ? (
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
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChartContainer);
