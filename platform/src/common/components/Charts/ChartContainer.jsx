import React, { useRef, useCallback, useState, useEffect, memo } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Spinner from '@/components/Spinner';
import CheckIcon from '@/icons/tickIcon';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import PrintReportModal from '@/components/Modal/PrintReportModal';
import Chart from './Charts';
import { setRefreshChart } from '@/lib/store/services/charts/ChartSlice';

const ChartContainer = memo(
  ({
    chartType,
    chartTitle,
    height = '300px',
    width = '100%',
    id,
    defaultBody = {},
    showTitle = true,
  }) => {
    const dispatch = useDispatch();
    const chartRef = useRef(null);
    const dropdownRef = useRef(null);

    const {
      status: isLoading,
      chartDataRange,
      chartSites,
    } = useSelector((state) => state.chart, shallowEqual);

    const [openShare, setOpenShare] = useState(false);
    const [shareFormat, setShareFormat] = useState(null);
    const [loadingFormat, setLoadingFormat] = useState(null);
    const [downloadComplete, setDownloadComplete] = useState(null);

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

        if (format === 'png' || format === 'jpg') {
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
              <span className="-mr-2">
                {loadingFormat === format && <Spinner width={15} height={15} />}
                {downloadComplete === format && (
                  <CheckIcon fill="#1E40AF" width={20} height={20} />
                )}
              </span>
            </button>
          ))}
          <hr className="border-gray-200" />
          {['csv', 'pdf'].map((format) => (
            <button
              key={format}
              onClick={() => shareReport(format)}
              className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span>Share report as {format.toUpperCase()}</span>
            </button>
          ))}
        </>
      ),
      [exportChart, loadingFormat, downloadComplete, refreshChart, shareReport],
    );

    return (
      <div
        className="border bg-white rounded-xl border-grey-150 shadow-sm"
        id="analytics-chart"
      >
        <div className="flex flex-col items-start gap-1 w-full p-4">
          {showTitle && (
            <div className="flex items-center justify-between w-full h-8">
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
                  {isLoading ? (
                    <div className="p-2">
                      <Spinner width={20} height={20} />
                    </div>
                  ) : (
                    renderDropdownContent()
                  )}
                </CustomDropdown>
              </div>
            </div>
          )}
          <div
            ref={chartRef}
            className="mt-6 -ml-[27px] relative"
            style={{ width, height }}
          >
            <Chart
              customBody={defaultBody}
              id={id}
              chartType={chartType}
              width={width}
              height={height}
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
