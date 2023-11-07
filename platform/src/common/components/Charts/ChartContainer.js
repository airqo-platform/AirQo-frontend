import React, { useRef, useCallback } from 'react';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import Chart from './Charts';
import DotMenuIcon from '@/icons/Actions/three-dots-menu.svg';
import { useDispatch } from 'react-redux';
import { setChartTab, setChartType } from '@/lib/store/services/charts/ChartSlice';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ChartContainer = ({ chartType, chartTitle, menuBtn, height, width }) => {
  const dispatch = useDispatch();
  const chartRef = useRef(null);

  const exportChart = useCallback(
    async (format) => {
      if (!chartRef.current) return;

      // Get the dimensions of the chart
      const rect = chartRef.current.getBoundingClientRect();

      const extraSpace = 20;
      const width = rect.width + extraSpace;
      const height = rect.height + extraSpace;

      // Convert the chart to a canvas element
      const canvas = await html2canvas(chartRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: rect.backgroundColor,
        width: width,
        height: height,
      });

      // Create an anchor element for downloading the image
      const link = document.createElement('a');
      link.download = `chart.${format}`;

      switch (format) {
        case 'png':
        case 'jpeg':
          canvas.toBlob((blob) => {
            link.href = URL.createObjectURL(blob);
            link.click();
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
          break;
        default:
          throw new Error('Unsupported format');
      }
    },
    [chartRef],
  );

  const handleMoreClick = () => {
    dispatch(setChartTab(1));
    dispatch(setChartType(chartType));
  };

  const renderDropdown = () => (
    <CustomDropdown
      trigger={
        <button className='border-[0.5px] rounded-md border-gray-200 flex items-center justify-center p-[2px] hover:border-blue-500 relative'>
          <DotMenuIcon className='w-5 h-5 text-gray-600 mr-1 mb-[0.5px]' />
        </button>
      }
      id='options'
      dropStyle={{ top: '21px', right: '0', zIndex: 999 }}>
      <a
        href='#'
        onClick={() => exportChart('jpeg')}
        className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
        Export as JPEG
      </a>
      <a
        href='#'
        onClick={() => exportChart('pdf')}
        className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
        Export as PDF
      </a>
      <a
        href='#'
        onClick={() => exportChart('png')}
        className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
        Export as PNG
      </a>
    </CustomDropdown>
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
          className='mt-6 -ml-[27px] relative'
          style={{
            width: width || '100%',
            height: height,
          }}>
          <Chart chartType={chartType} width={width} height={height} />
        </div>
      </div>
    </div>
  );
};

export default ChartContainer;
