import React from 'react';

const HomeSkeleton = () => {
  return (
    <div className='px-3 lg:px-16 py-3 space-y-5'>
      <div className='w-full mb-4 md:mb-10 animate-pulse'>
        <h1 className='text-[32px] leading-10 font-medium bg-gray-300 h-10 w-3/4'></h1>
      </div>

      <div className='w-full flex justify-between items-center'>
        <div className='w-full flex flex-col items-start'>
          <h1 className='text-2xl font-medium text-gray-900 bg-gray-300 h-7 w-1/2'></h1>
          <p className='text-sm font-normal text-gray-500 bg-gray-300 h-5 w-3/4'></p>
        </div>
        <div className='w-full'>
          <div className='h-5 bg-gray-300 w-1/4'></div>
        </div>
      </div>

      <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className='w-full h-[250px] flex flex-col justify-between items-start border-[0.5px] rounded-xl border-grey-150 py-5 px-3 space-y-5 focus:outline-blue-600 focus:ring-2 focus:shadow-lg focus:border-blue-600 animate-pulse'
            tabIndex={0}>
            <div className='w-full bg-gray-300 h-14 flex justify-center items-center rounded-full'></div>
            <div className='w-full text-base font-normal bg-gray-300 h-5'></div>
            <div className={`w-full text-sm flex justify-between font-normal bg-gray-300 h-5`}>
              <span className='text-blue-600 bg-gray-300 h-4 w-1/4'></span>
              <span className='text-black-900 bg-gray-300 h-4 w-1/4'></span>
            </div>
          </div>
        ))}
      </div>

      <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-3 items-center border-[0.5px] rounded-xl border-grey-150 p-3'>
        <div className='flex flex-col justify-start p-8 animate-pulse'>
          <h1 className='text-black-900 text-2xl font-medium bg-gray-300 h-7 w-3/4'></h1>
          <p className='text-lg font-normal text-black-900 mt-2 bg-gray-300 h-5 w-3/4'></p>
          <div className='mt-4 flex items-center space-x-8'>
            <div className='bg-gray-300 text-white rounded-lg w-32 h-12'></div>
            <div className='text-gray-300 text-sm font-normal mt-2 cursor-pointer bg-gray-300 h-5 w-1/4'></div>
          </div>
        </div>
        <div
          className='rounded-md p-9 relative bg-gray-300'
          style={{
            background: '#145DFF08',
          }}>
          <div className='absolute z-50 inset-0 flex items-center justify-center cursor-pointer'>
            <div className='w-8 h-8 bg-gray-300 rounded-full'></div>
          </div>
          <div className='bg-gray-300 h-48 w-72'></div>
        </div>
      </div>
    </div>
  );
};

export default HomeSkeleton;
