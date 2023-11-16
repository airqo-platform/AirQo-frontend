import React from 'react';
import { format } from 'date-fns';

const Footer = ({ selectedRange, setSelectedRange, handleValueChange, close }) => {
  const handleCancel = () => {
    setSelectedRange({ start: null, end: null });
    close();
  };

  const handleApply = () => {
    handleValueChange(selectedRange);
  };

  return (
    <div className='flex flex-col items-center justify-between px-6 py-4 border-t border-gray-100 md:flex-row'>
      <div className='hidden md:flex md:items-center md:space-x-2'>
        <input
          type='text'
          readOnly
          value={selectedRange.start ? format(selectedRange.start, 'MMM d, yyyy') : ''}
          className='flex items-center w-full px-4 py-3 text-sm border border-gray-300 text-gray-600 rounded-md focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none md:w-32'
          placeholder='Start date'
        />
        <div className='p-2'>
          <span className='text-gray-600 text-[16px]'>-</span>
        </div>
        <input
          type='text'
          readOnly
          value={selectedRange.end ? format(selectedRange.end, 'MMM d, yyyy') : ''}
          className='flex items-center w-full px-4 py-3 text-sm border border-gray-300 text-gray-600 rounded-md focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none md:w-32'
          placeholder='End date'
        />
      </div>
      <div className='flex items-center space-x-2 mt-2 md:mt-0'>
        <button
          onClick={handleCancel}
          className='px-4 py-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-600 hover:bg-gray-100 w-full md:w-auto'>
          Cancel
        </button>
        <button
          onClick={handleApply}
          className='px-4 py-3 text-sm text-white bg-blue-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 hover:bg-blue-700 w-full md:w-auto'>
          Apply
        </button>
      </div>
    </div>
  );
};

export default Footer;
