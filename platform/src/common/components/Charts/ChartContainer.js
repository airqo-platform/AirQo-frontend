import React, { useRef, useCallback, useState, useEffect } from 'react';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import Chart from './Charts';
import DotMenuIcon from '@/icons/Actions/three-dots-menu.svg';
import { useDispatch } from 'react-redux';
import { setChartTab, setChartType } from '@/lib/store/services/charts/ChartSlice';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Spinner from '@/components/Spinner';
import CheckIcon from '@/icons/tickIcon';

const ChartContainer = ({ chartType, chartTitle, menuBtn, height, width, id }) => {
  const dispatch = useDispatch();
  const chartRef = useRef(null);
  const dropdownRef = useRef(null);
  const [loadingFormat, setLoadingFormat] = useState(null);
  const [downloadComplete, setDownloadComplete] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDownloadComplete(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [downloadComplete]);

  const exportChart = useCallback(async (format) => {
    setLoadingFormat(format);
    if (!chartRef.current) return;

    const rect = chartRef.current.getBoundingClientRect();
    const extraSpace = 20;
    const width = rect.width + extraSpace;
    const height = rect.height + extraSpace;

    const canvas = await html2canvas(chartRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: rect.backgroundColor,
      width: width,
      height: height,
    });

    const link = document.createElement('a');
    link.download = `chart.${format}`;

    switch (format) {
      case 'png':
      case 'jpeg':
        canvas.toBlob((blob) => {
          link.href = URL.createObjectURL(blob);
          link.click();
          setLoadingFormat(null);
          setDownloadComplete(format);
        }, `image/${format}`);
        break;
      case 'pdf':
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [width, height],
        });
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, width, height);
        pdf.save('chart.pdf');
        setLoadingFormat(null);
        setDownloadComplete(format);
        break;
      default:
        throw new Error('Unsupported format');
    }
  }, []);

  const handleMoreClick = () => {
    dispatch(setChartTab(1));
    dispatch(setChartType(chartType));
  };

  const renderDropdown = () => (
    <div ref={dropdownRef}>
      <CustomDropdown
        trigger={
          <button className='border-[0.5px] rounded-md border-gray-200 flex items-center justify-center p-[2px] hover:border-blue-500 relative'>
            <DotMenuIcon className='w-5 h-5 text-gray-600 mr-1 mb-[0.5px]' />
          </button>
        }
        id='options'
        dropStyle={{ top: '21px', right: '0', zIndex: 999 }}
      >
        {['jpeg', 'pdf', 'png'].map((format) => (
          <a
            key={format}
            href='#'
            onClick={() => exportChart(format)}
            className='flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
          >
            <span>Export as {format.toUpperCase()}</span>
            <span className='-mr-2'>
              {loadingFormat === format && <Spinner width={15} height={15} />}
              {downloadComplete === format && <CheckIcon fill='#1E40AF' width={20} height={20} />}
            </span>
          </a>
        ))}
      </CustomDropdown>
    </div>
  );

  return (
    <div className='border-[0.5px] rounded-lg border-grey-150 shadow-[0px_0px_0px_0px_rgba(83,106,135,0.00)]'>
      <div className='flex flex-col items-start gap-1 w-auto h-auto p-4'>
        <div className='flex items-center justify-between w-full h-8'>
          <div className='text-lg not-italic font-medium leading-[26px] text-gray-600'>
            {chartTitle}
          </div>
          {menuBtn ? (
            renderDropdown()
          ) : (
            <button onClick={handleMoreClick}>
              <span className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer'>
                More
              </span>
            </button>
          )}
        </div>
        <div
          ref={chartRef}
          id={id}
          className='mt-6 -ml-[27px] relative'
          style={{
            width: width || '100%',
            height: height,
          }}
        >
          <Chart chartType={chartType} width={width} height={height} />
        </div>
      </div>
    </div>
  );
};

export default ChartContainer;
