import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Chart from './Charts';
import DotMenuIcon from '@/icons/Actions/three-dots-menu.svg';

const ChartContainer = ({ chartType, chartTitle, menuBtn }) => {
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleDropdown = () => {
    setDropdown(!dropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='border-[0.5px] rounded-lg border-grey-150 shadow-[0px_0px_0px_0px_rgba(83,106,135,0.00)]'>
      <div className='flex flex-col items-start gap-1 w-auto h-auto p-4'>
        <div className='flex items-center justify-between w-full h-8'>
          <div className='text-lg not-italic font-medium leading-[26px] text-gray-600'>
            {chartTitle}
          </div>
          <div ref={dropdownRef}>
            {menuBtn ? (
              <button
                className='border-[0.5px] rounded-md border-gray-200 flex items-center justify-center p-[2px] hover:border-blue-500 relative'
                onClick={handleDropdown}>
                <DotMenuIcon className='w-5 h-5 text-gray-600 mr-1 mb-[0.5px]' />
                {dropdown && (
                  <div
                    className='absolute right-0 top-5 mt-2 w-40 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg'
                    style={{
                      zIndex: 99999,
                    }}>
                    <div className='py-1'>
                      <a
                        href='#'
                        className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                        paul 1
                      </a>
                      <a
                        href='#'
                        className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                        paul 2
                      </a>
                    </div>
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  console.log('More clicked');
                }}>
                <span className='text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer'>
                  More
                </span>
              </button>
            )}
          </div>
        </div>
        <div
          className='mt-6 -ml-[27px]'
          style={{
            width: '100%',
            height: 496,
          }}>
          <Chart chartType={chartType} width={'100%'} height={'100%'} />
        </div>
      </div>
    </div>
  );
};

export default ChartContainer;
