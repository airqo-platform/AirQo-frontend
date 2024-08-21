'use client';
import React, { useRef, useCallback, useState, useEffect, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import Chart from './Charts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Spinner from '@/components/Spinner';
import CheckIcon from '@/icons/tickIcon';
import PrintReportModal from '@/components/Modal/PrintReportModal';
import { setRefreshChart } from '@/lib/store/services/charts/ChartSlice';

const ChartContainer = memo(({ chartType, chartTitle, height, width, id }) => {
  const dispatch = useDispatch();
  const chartRef = useRef(null);
  const dropdownRef = useRef(null);
  const { status: isLoading, chartDataRange, chartSites } = useSelector((state) => state.chart);
  const [openShare, setOpenShare] = useState(false);
  const [shareFormat, setShareFormat] = useState(null);
  const [loadingFormat, setLoadingFormat] = useState(null);
  const [downloadComplete, setDownloadComplete] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDownloadComplete(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportChart = useCallback(
    async (format) => {
      if (!chartRef.current) return;

      setDownloadComplete(null);
      setLoadingFormat(format);

      try {
        const rect = chartRef.current.getBoundingClientRect();
        const extraSpace = 20;
        const canvasWidth = rect.width + extraSpace;
        const canvasHeight = rect.height + extraSpace;

        const canvas = await html2canvas(chartRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: rect.backgroundColor,
          width: canvasWidth,
          height: canvasHeight,
          scrollX: 0,
          scrollY: 0,
        });

        const link = document.createElement('a');
        link.download = `airquality-data.${format}`;

        if (format === 'png' || format === 'jpg') {
          canvas.toBlob(
            (blob) => {
              link.href = URL.createObjectURL(blob);
              link.click();
              setLoadingFormat(null);
              setDownloadComplete(format);
            },
            `image/${format}`,
            0.8
          );
        } else if (format === 'pdf') {
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvasWidth, canvasHeight],
          });
          pdf.addImage(canvas.toDataURL('image/png', 0.8), 'PNG', 0, 0, canvasWidth, canvasHeight);
          pdf.save('airquality-data.pdf');
          setLoadingFormat(null);
          setDownloadComplete(format);
        } else {
          throw new Error('Unsupported format');
        }
      } catch (error) {
        console.error('Error exporting chart:', error);
        setLoadingFormat(null);
      }
    },
    [chartRef]
  );

  const refreshChart = () => {
    dispatch(setRefreshChart(true));
  };

  const shareReport = (format) => {
    setShareFormat(format);
    setOpenShare(true);
  };

  const renderDropdownContent = useCallback(() => {
    return (
      <>
        <a
          onClick={refreshChart}
          className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
        >
          <span>Refresh</span>
        </a>
        <hr className="border-gray-200" />
        {['jpg', 'pdf'].map((format) => (
          <a
            key={format}
            onClick={() => exportChart(format)}
            className="flex justify-between items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <span>Export as {format.toUpperCase()}</span>
            <span className="-mr-2">
              {loadingFormat === format && <Spinner width={15} height={15} />}
              {downloadComplete === format && <CheckIcon fill="#1E40AF" width={20} height={20} />}
            </span>
          </a>
        ))}
        <hr className="border-gray-200" />
        {['csv', 'pdf'].map((format) => (
          <a
            key={format}
            onClick={() => shareReport(format)}
            className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <span>Share report as {format.toUpperCase()}</span>
          </a>
        ))}
      </>
    );
  }, [refreshChart, exportChart, loadingFormat, downloadComplete, shareReport]);

  return (
    <div
      className="border-[0.5px] bg-white rounded-xl border-grey-150 shadow-sm"
      id="analytics-chart"
    >
      <div className="flex flex-col items-start gap-1 w-auto h-auto p-4">
        <div className="flex items-center justify-between w-full h-8">
          <div className="text-lg not-italic font-medium leading-[26px]">{chartTitle}</div>
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
        <div
          ref={chartRef}
          className="mt-6 -ml-[27px] relative"
          style={{ width: width || '100%', height: height || '300px' }}
        >
          <Chart id={id} chartType={chartType} width={width} height={height} />
        </div>
      </div>

      <PrintReportModal
        title="Share report"
        btnText="Send"
        shareModel={true}
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
});

export default ChartContainer;
