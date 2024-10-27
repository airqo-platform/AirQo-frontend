import React, { useRef, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import CheckIcon from '@/icons/tickIcon';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
// import PrintReportModal from '@/components/Modal/PrintReportModal'; // Retained as per request
import MoreInsightsChart from './MoreInsightsChart';
import SkeletonLoader from './components/SkeletonLoader';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import CustomToast from '../Toast/CustomToast';

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
  const user_selected_sites = preferencesData?.[0]?.selected_sites || [];

  // State for handling sharing and exporting
  const [loadingFormat, setLoadingFormat] = React.useState(null);
  const [downloadComplete, setDownloadComplete] = React.useState(null);

  // Handle click outside for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDownloadComplete(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Exports the chart in the specified format.
   *
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
      CustomToast();
    } catch (error) {
      console.error('Error exporting chart:', error);
    } finally {
      setLoadingFormat(null);
    }
  }, []);

  /**
   * Refreshes the chart data by calling the refetch function from the hook.
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
  const renderDropdownContent = useCallback(
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
          onClick={() => handleOpenModal('inSights', [], user_selected_sites)}
          className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          More insights
        </button>
        {/* 
        {['csv', 'pdf'].map((format) => (
          <button
            key={format}
            onClick={() => shareReport(format)}
            className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <span>Share report as {format.toUpperCase()}</span>
          </button>
        ))} 
        */}
      </>
    ),
    [
      exportChart,
      loadingFormat,
      downloadComplete,
      handleRefreshChart,
      handleOpenModal,
      user_selected_sites,
    ],
  );

  const ErrorOverlay = () => (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-300 bg-opacity-50 z-10">
      <p className="text-red-500 font-semibold">
        Something went wrong. Please try again.
      </p>
      <button
        onClick={refetch}
        className="ml-4 text-red-500 font-semibold underline"
      >
        Try again
      </button>
    </div>
  );

  return (
    <div
      className="border bg-white rounded-xl border-gray-200 shadow-sm"
      id="analytics-chart"
    >
      <div className="flex flex-col items-start gap-1 w-full p-4">
        {showTitle && !chartLoading && (
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
                {renderDropdownContent()}
              </CustomDropdown>
            </div>
          </div>
        )}
        <div ref={chartRef} className="my-3 relative" style={{ width, height }}>
          {chartLoading ? (
            <SkeletonLoader width={width} height={height} />
          ) : error ? (
            <ErrorOverlay />
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
            />
          )}
        </div>
      </div>

      {/* 
      <PrintReportModal
        title="Share Report"
        btnText="Send"
        shareModel
        open={openShare}
        onClose={() => setOpenShare(false)}
        format={shareFormat}
        data={{
          startDate: chartDataRange.startDate,
          endDate: chartDataRange.endDate,
          sites: chartSites,
        }}
      /> 
      */}
    </div>
  );
};

ChartContainer.propTypes = {
  chartType: PropTypes.oneOf(['line', 'bar']).isRequired,
  chartTitle: PropTypes.string.isRequired,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.string.isRequired,
  showTitle: PropTypes.bool,
  data: PropTypes.array.isRequired,
  chartLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  refetch: PropTypes.func.isRequired,
  // defaultBody: PropTypes.object, // Commented out as per your request
};

export default ChartContainer;
