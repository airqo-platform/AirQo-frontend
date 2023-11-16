import React from 'react';

const CalendarHeader = ({ month, onNext, onPrev }) => {
  return (
    <div className='flex items-center justify-between'>
      <button
        className='flex items-center justify-center p-2 hover:bg-gray-50 border border-gray-300 rounded-md'
        onClick={onPrev}>
        <svg className='w-6 h-6 text-gray-500 stroke-current' fill='none'>
          <path
            d='M13.25 8.75L9.75 12l3.5 3.25'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </button>
      <div className='text-sm text-gray-700 font-semibold'>{month}</div>
      <button
        className='flex items-center justify-center p-2 hover:bg-gray-50 border border-gray-300 rounded-md'
        onClick={onNext}>
        <svg className='w-6 h-6 text-gray-500 stroke-current' fill='none'>
          <path
            d='M10.75 8.75l3.5 3.25-3.5 3.25'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </button>
    </div>
  );
};

export default CalendarHeader;
