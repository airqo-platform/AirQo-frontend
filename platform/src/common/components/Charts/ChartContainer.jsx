// src/components/ChartContainer.jsx
import React, {
  useRef,
  useCallback,
  useState,
  useEffect,
  memo,
  useMemo,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import CheckIcon from '@/icons/tickIcon';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import PrintReportModal from '@/components/Modal/PrintReportModal';
import MoreInsightsChart from './MoreInsightsChart';
import { setRefreshChart } from '@/lib/store/services/charts/ChartSlice';
import SkeletonLoader from './components/SkeletonLoader';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import useFetchAnalyticsData from '@/core/utils/useFetchAnalyticsData';

const ChartContainer = memo(
  ({
    chartType,
    chartTitle,
    height = '300px',
    width = '100%',
    id,
    showTitle = true,
  }) => {
    const dispatch = useDispatch();
    const chartRef = useRef(null);
    const dropdownRef = useRef(null);

    const {
      chartDataRange,
      chartSites,
      timeFrame,
      organizationName,
      pollutionType,
    } = useSelector((state) => state.chart);

    const [openShare, setOpenShare] = useState(false);
    const [shareFormat, setShareFormat] = useState(null);
    const [loadingFormat, setLoadingFormat] = useState(null);
    const [downloadComplete, setDownloadComplete] = useState(null);

    const preferencesData = useSelector(
      (state) => state.defaults.individual_preferences,
    );

    const user_selected_sites = preferencesData?.[0]?.selected_sites;

    // Extract selected site IDs from preferencesData
    const selectedSiteIds = useMemo(() => {
      return (
        preferencesData?.[0]?.selected_sites?.map((site) => site._id) || []
      );
    }, []);

    const { allSiteData, chartLoading } = useFetchAnalyticsData({
      selectedSiteIds,
      dateRange: chartDataRange,
      chartType,
      frequency: timeFrame,
      pollutant: pollutionType,
      organisationName: organizationName,
    });

    // Handle click outside for dropdown
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setDownloadComplete(null);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
          document.body.appendChild(link); // Append to body to make it clickable in Firefox
          link.click();
          document.body.removeChild(link); // Remove after clicking
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
      } catch (error) {
        console.error('Error exporting chart:', error);
      } finally {
        setLoadingFormat(null);
      }
    }, []);

    const refreshChart = useCallback(() => {
      dispatch(setRefreshChart(true));
    }, [dispatch]);

    const shareReport = useCallback((format) => {
      setShareFormat(format);
      setOpenShare(true);
    }, []);

    const handleOpenModal = useCallback(
      (type, ids = null, data = null) => {
        dispatch(setModalType({ type, ids, data }));
        dispatch(setOpenModal(true));
      },
      [dispatch],
    );

    const renderDropdownContent = useCallback(
      () => (
        <>
          <button
            onClick={refreshChart}
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
          {/* {['csv', 'pdf'].map((format) => (
            <button
              key={format}
              onClick={() => shareReport(format)}
              className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span>Share report as {format.toUpperCase()}</span>
            </button>
          ))} */}
        </>
      ),
      [exportChart, loadingFormat, downloadComplete, refreshChart, shareReport],
    );

    return (
      <div
        className="border bg-white rounded-xl border-gray-200 shadow-sm"
        id="analytics-chart"
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
                  {chartLoading ? (
                    <SkeletonLoader
                      width="100%"
                      height="40px"
                      className="p-2"
                    />
                  ) : (
                    renderDropdownContent()
                  )}
                </CustomDropdown>
              </div>
            </div>
          )}
          <div
            ref={chartRef}
            className="my-6 relative"
            style={{ width, height }}
          >
            <MoreInsightsChart
              data={allSiteData}
              selectedSites={selectedSiteIds}
              chartType={chartType}
              frequency={timeFrame}
              width="100%"
              height={height}
              id={id}
              pollutantType={pollutionType}
              isLoading={chartLoading}
            />
          </div>
        </div>

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
      </div>
    );
  },
);

ChartContainer.propTypes = {
  chartType: PropTypes.oneOf(['line', 'bar']).isRequired,
  chartTitle: PropTypes.string.isRequired,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.string.isRequired,
  defaultBody: PropTypes.object,
  showTitle: PropTypes.bool,
};

ChartContainer.displayName = 'ChartContainer';

export default ChartContainer;
