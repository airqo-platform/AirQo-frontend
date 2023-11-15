import React from 'react';

const Footer = () => {
  return (
    <div className='flex items-center justify-between px-6 py-4 border-t border-gray-100'>
      <div className='flex items-center'>
        <input
          type='text'
          className='flex items-center w-32 px-4 py-3 text-sm border border-gray-300 text-gray-600 rounded-md focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none'
          placeholder='May 8, 2023'
        />
        <div className='p-2'>
          <span className='text-gray-600 text-[16px]'>-</span>
        </div>
        <input
          type='text'
          className='flex items-center w-32 px-4 py-3 text-sm border border-gray-300 text-gray-600 rounded-md focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none'
          placeholder='May 18, 2023'
        />
      </div>
      <div className='flex items-center space-x-2'>
        <button className='px-4 py-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-600 hover:bg-gray-100'>
          Cancel
        </button>
        <button className='px-4 py-3 text-sm text-white bg-blue-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 hover:bg-blue-700'>
          Apply
        </button>
      </div>
    </div>
  );
};

export default Footer;
