import React from 'react';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import Chart from './Charts';
import DotMenuIcon from '@/icons/Actions/three-dots-menu.svg';
import { useDispatch } from 'react-redux';
import { setChartTab, setChartType } from '@/lib/store/services/charts/ChartSlice';

const ChartContainer = ({ chartType, chartTitle, menuBtn, height, width }) => {
  const dispatch = useDispatch();
  return (
    <div className='border-[0.5px] rounded-lg border-grey-150 shadow-[0px_0px_0px_0px_rgba(83,106,135,0.00)]'>
      <div className='flex flex-col items-start gap-1 w-auto h-auto p-4'>
        <div className='flex items-center justify-between w-full h-8'>
          <div className='text-lg not-italic font-medium leading-[26px] text-gray-600'>
            {chartTitle}
          </div>
          {menuBtn ? (
            <CustomDropdown
              trigger={
                <button className='border-[0.5px] rounded-md border-gray-200 flex items-center justify-center p-[2px] hover:border-blue-500 relative'>
                  <DotMenuIcon className='w-5 h-5 text-gray-600 mr-1 mb-[0.5px]' />
                </button>
              }
              id='options'
              dropStyle={{ top: '21px', right: '0', zIndex: 999 }}>
              <a href='#' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                Export as an Excel file
              </a>
              <a href='#' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                Export as CSV
              </a>
              <a href='#' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                Export as PDF
              </a>
              <a href='#' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                Export as PNG
              </a>
            </CustomDropdown>
          ) : (
            <button
              onClick={() => {
                dispatch(setChartTab(1));
                dispatch(setChartType(chartType));
              }}>
              <span className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer'>
                More
              </span>
            </button>
          )}
        </div>
        <div
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
